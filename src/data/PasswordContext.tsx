import React, { createContext, useContext, useReducer, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import JSZip from "jszip";
import zxcvbn from "zxcvbn";
import api from "@/lib/api";

/**
 * Typ reprezentujący tabelę haseł.
 */
export type PasswordTable = {
  id: string;
  passwordfile: string;
  logo: string;
  platform: string;
  login: string;
};

/**
 * Typ reprezentujący historię haseł.
 */
export type PasswordHistory = {
  id: string;
  platform: string;
  login: string;
  strength: number;
  timestamp: string;
};

/**
 * Typ reprezentujący zaufane urządzenie.
 */
export type TrustedDevice = {
  user_id: string;
  device_id: string;
  user_agent: string;
  is_trusted: boolean;
};

/**
 * Typ reprezentujący użytkownika.
 */
export type User = {
  id: string;
  first_name: string;
  last_name: string;
  login: string;
  password: string;
};

/**
 * Typ reprezentujący wpis logowania.
 */
export type LoginEntry = {
  timestamp: string;
  user_id: string;
  login: string;
  page: string;
};

/**
 * Typ reprezentujący stan kontekstu haseł.
 */
export type PasswordState = {
  passwords: PasswordTable[];
  history: PasswordHistory[];
  trustedDevices: TrustedDevice[];
  currentUser: User | null;
  zip: JSZip | null;
  loading: boolean;
  token: string | null;
  userLogins: LoginEntry[];
  encryptionKey?: CryptoKey;
};

/**
 * Typ reprezentujący akcje w kontekście haseł.
 */
export type PasswordAction =
  | { type: "SET_DATA"; payload: { passwords: PasswordTable[]; trustedDevices: TrustedDevice[]; currentUser: User; zip: JSZip } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_PASSWORDS"; payload: PasswordTable[] }
  | { type: "ADD_PASSWORD"; payload: PasswordTable }
  | { type: "UPDATE_PASSWORD"; payload: PasswordTable }
  | { type: "DELETE_PASSWORD"; payload: { platform: string; login: string } }
  | { type: "UPDATE_HISTORY"; payload: PasswordHistory }
  | { type: "ADD_OR_UPDATE_DEVICE"; payload: TrustedDevice }
  | { type: "DELETE_DEVICE"; payload: { device_id: string } }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "ADD_USER"; payload: User }
  | { type: "SET_TOKEN"; payload: string | null }
  | { type: "LOGOUT" }
  | { type: "SET_USER_LOGINS"; payload: LoginEntry[] }
  | { type: "SET_HISTORY"; payload: PasswordHistory[] }
  | { type: "SET_ZIP"; payload: JSZip }
  | { type: "SET_ENCRYPTION_KEY"; payload: CryptoKey };

/**
 * Reduktor stanu kontekstu haseł.
 * @param state Aktualny stan kontekstu haseł.
 * @param action Akcja do wykonania na stanie.
 * @returns Zaktualizowany stan kontekstu haseł.
 */
export const passwordReducer = (state: PasswordState, action: PasswordAction): PasswordState => {
  switch (action.type) {
    case "SET_DATA":
      return {
        ...state,
        passwords: action.payload.passwords,
        trustedDevices: action.payload.trustedDevices,
        currentUser: action.payload.currentUser,
        zip: action.payload.zip,
        loading: false,
      };
    case "SET_PASSWORDS":
      return { ...state, passwords: action.payload };
    case "SET_ZIP":
      return { ...state, zip: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "ADD_PASSWORD":
      return { ...state, passwords: [...state.passwords, action.payload] };
    case "UPDATE_PASSWORD":
      return {
        ...state,
        passwords: state.passwords.map((p) =>
          p.platform === action.payload.platform && p.login === action.payload.login ? action.payload : p
        ),
      };
    case "DELETE_PASSWORD":
      return {
        ...state,
        passwords: state.passwords.filter(
          (p) => !(p.platform === action.payload.platform && p.login === action.payload.login)
        ),
      };
    case "UPDATE_HISTORY":
      const updatedHistory = state.history.filter((item) => item.id !== action.payload.id);
      const newHistory = [...updatedHistory, action.payload];
      if (state.currentUser) {
        localStorage.setItem(`passwordHistory`, JSON.stringify(newHistory));
      }
      return { ...state, history: newHistory };
    case "ADD_OR_UPDATE_DEVICE":
      const deviceExists = state.trustedDevices.some(
        (d) => d.device_id === action.payload.device_id && d.user_id === action.payload.user_id
      );
      return {
        ...state,
        trustedDevices: deviceExists
          ? state.trustedDevices.map((d) =>
              d.device_id === action.payload.device_id && d.user_id === action.payload.user_id ? action.payload : d
            )
          : [...state.trustedDevices, action.payload],
      };
    case "DELETE_DEVICE":
      return {
        ...state,
        trustedDevices: state.trustedDevices.filter((d) => d.device_id !== action.payload.device_id),
      };
    case "UPDATE_USER":
      return { ...state, currentUser: action.payload };
    case "ADD_USER":
      return { ...state, currentUser: action.payload };
    case "SET_TOKEN":
      return { ...state, token: action.payload };
    case "LOGOUT":
      if (state.currentUser) {
        localStorage.setItem(`passwordHistory`, JSON.stringify(state.history));
      }
      localStorage.removeItem("jwt_token");
      return {
        ...state,
        passwords: [],
        trustedDevices: [],
        currentUser: null,
        zip: null,
        token: null,
        userLogins: [],
        encryptionKey: undefined,
      };
    case "SET_USER_LOGINS":
      return { ...state, userLogins: action.payload };
    case "SET_HISTORY":
      return { ...state, history: action.payload };
    case "SET_ENCRYPTION_KEY":
      return { ...state, encryptionKey: action.payload };
    default:
      return state;
  }
};

/**
 * Funkcja szyfrująca klucz główny (masterkey) za pomocą hasła.
 * @param masterkey Klucz główny do zaszyfrowania.
 * @param password Hasło do szyfrowania.
 * @returns Zaszyfrowany klucz główny w formacie base64.
 */
export const encryptMasterkey = async (masterkey: string, password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]),
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    derivedKey,
    encoder.encode(masterkey)
  );
  const result = new Uint8Array([...salt, ...iv, ...new Uint8Array(encrypted)]);
  return arrayBufferToBase64(result.buffer);
};

/**
 * Funkcja deszyfrująca klucz główny (masterkey) za pomocą hasła.
 * @param encryptedMasterkeyBase64 Zaszyfrowany klucz główny w formacie base64.
 * @param password Hasło do deszyfrowania.
 * @returns Odszyfrowany klucz główny.
 */
export const decryptMasterkey = async (encryptedMasterkeyBase64: string, password: string): Promise<string> => {
  const encryptedData = base64ToArrayBuffer(encryptedMasterkeyBase64);
  const salt = encryptedData.slice(0, 16);
  const iv = encryptedData.slice(16, 28);
  const encrypted = encryptedData.slice(28);
  const encoder = new TextEncoder();
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]),
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    derivedKey,
    encrypted
  );
  return new TextDecoder().decode(decrypted);
};

/**
 * Funkcja wyprowadzająca klucz szyfrowania z klucza głównego (masterkey).
 * @param masterkey Klucz główny.
 * @returns Klucz szyfrowania.
 */
export const deriveEncryptionKeyFromMasterkey = async (masterkey: string): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("salt-for-masterkey"),
      iterations: 100000,
      hash: "SHA-256",
    },
    await crypto.subtle.importKey("raw", encoder.encode(masterkey), "PBKDF2", false, ["deriveKey"]),
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
};

/**
 * Funkcja szyfrująca hasło za pomocą klucza szyfrowania.
 * @param password Hasło do zaszyfrowania.
 * @param key Klucz szyfrowania.
 * @returns Zaszyfrowane hasło i wektor inicjalizacyjny (IV).
 */
export const encryptPassword = async (password: string, key: CryptoKey): Promise<{ encrypted: string; iv: string }> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  return {
    encrypted: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv),
  };
};

/**
 * Funkcja deszyfrująca hasło za pomocą klucza szyfrowania.
 * @param encrypted Zaszyfrowane hasło.
 * @param iv Wektor inicjalizacyjny (IV).
 * @param key Klucz szyfrowania.
 * @returns Odszyfrowane hasło.
 */
export const decryptPassword = async (encrypted: string, iv: string, key: CryptoKey): Promise<string> => {
  const decoder = new TextDecoder();
  const encryptedData = base64ToArrayBuffer(encrypted);
  const ivData = base64ToArrayBuffer(iv);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivData },
    key,
    encryptedData
  );
  return decoder.decode(decrypted);
};

/**
 * Funkcja konwertująca ArrayBuffer na base64.
 * @param buffer ArrayBuffer do konwersji.
 * @returns Base64 reprezentacja ArrayBuffer.
 */
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

/**
 * Funkcja konwertująca base64 na ArrayBuffer.
 * @param base64 Base64 do konwersji.
 * @returns ArrayBuffer reprezentacja base64.
 */
export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Funkcja wyodrębniająca hasło z pliku ZIP.
 * @param zip Plik ZIP.
 * @param filename Nazwa pliku.
 * @param key Klucz szyfrowania.
 * @returns Odszyfrowane hasło.
 */
const extractPasswordFromZip = async (zip: JSZip, filename: string, key: CryptoKey) => {
  const file = zip.file(filename);
  if (!file) throw new Error("Plik nie znaleziony w ZIP");
  const encryptedData = await file.async("string");
  const [encrypted, iv] = encryptedData.split(":");
  return decryptPassword(encrypted, iv, key);
};

/**
 * Provider kontekstu haseł.
 * @param children Dzieci komponentu.
 * @returns Provider kontekstu haseł.
 */
export const PasswordProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(passwordReducer, {
    passwords: [],
    history: [],
    trustedDevices: [],
    currentUser: null,
    zip: null,
    loading: true,
    token: typeof window !== "undefined" ? localStorage.getItem("jwt_token") || null : null,
    userLogins: [],
  });

  const [shouldFetchData, setShouldFetchData] = useState(false);

   /**
   * Ustawia token JWT w stanie i localStorage.
   * @param token - Token JWT lub null (dla wylogowania).
   */
  const setToken = (token: string | null) => {
    dispatch({ type: "SET_TOKEN", payload: token });
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("jwt_token", token);
      } else {
        localStorage.removeItem("jwt_token");
      }
    }
  };

/**
 * Wylogowuje użytkownika, czyszcząc stan, localStorage i przekierowując na stronę logowania.
 */
const logout = () => {
    if (state.currentUser) {
      localStorage.setItem(`passwordHistory`, JSON.stringify(state.history));
      localStorage.removeItem(`masterkey`);
    }
    localStorage.removeItem("jwt_token");
    dispatch({ type: "LOGOUT" });
    setShouldFetchData(false);
    toast.success("Wylogowano pomyślnie!", { duration: 3000 });
    window.location.href = "/login";
  };

   /**
   * Loguje użytkownika, ustawia token, Masterkey i klucz szyfrowania, oraz inicjuje pobieranie danych.
   * @param login - Adres email użytkownika.
   * @param password - Hasło użytkownika.
   * @param masterkey - Klucz główny do szyfrowania.
   * @param token2 - Token reCAPTCHA.
   * @throws Error - Jeśli dane logowania są nieprawidłowe lub Masterkey nie pasuje.
   */
  const login = async (login: string, password: string, masterkey: string, token2: string) => {
    try {
      const response = await api.post<{ user: User; token: string }>(`/login`, {
        login,
        password,
        token2
      });
      const { user, token } = response.data;
      setToken(token);
      dispatch({ type: "UPDATE_USER", payload: user });

      const encryptedMasterkey = localStorage.getItem(`masterkey`);
      let encryptionKey: CryptoKey;
      if (encryptedMasterkey) {
        const decryptedMasterkey = await decryptMasterkey(encryptedMasterkey, "123");
        if (decryptedMasterkey !== masterkey) {
          throw new Error("Podane hasło szyfrowania (masterkey) jest nieprawidłowe.");
        }
        encryptionKey = await deriveEncryptionKeyFromMasterkey(masterkey);
      } else {
        encryptionKey = await deriveEncryptionKeyFromMasterkey(masterkey);
        const encryptedMasterkey = await encryptMasterkey(masterkey, "123");
        localStorage.setItem(`masterkey`, encryptedMasterkey);
      }
      dispatch({ type: "SET_ENCRYPTION_KEY", payload: encryptionKey });

      const savedHistory = localStorage.getItem(`passwordHistory`);
      if (savedHistory) {
        dispatch({ type: "SET_HISTORY", payload: JSON.parse(savedHistory) });
      }
      setShouldFetchData(true);
      toast.success("Zalogowano pomyślnie!", {
        description: `Witaj, ${user.first_name} ${user.last_name}!`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Błąd logowania:", error);
      toast.error("Błąd logowania!", { description: "Nieprawidłowy login, hasło lub masterkey.", duration: 3000 });
      throw error;
    }
  };

  /**
   * Pobiera historię logowań użytkownika z API lub pamięci podręcznej.
   * @param userId - ID użytkownika.
   * @returns Lista wpisów logowania.
   * @throws Error - Jeśli brak tokenu lub żądanie API nie powiedzie się.
   */
  const getUserLogins = async (userId: string): Promise<LoginEntry[]> => {
    try {
      const cachedLogins = state.userLogins.filter((entry) => entry.user_id === userId);
      if (cachedLogins.length > 0) {
        console.log(`Zwracam zapisane logowania dla użytkownika ${userId} z pamięci podręcznej`);
        return cachedLogins;
      }

      const token = state.token;
      if (!token) throw new Error("Brak tokenu JWT");

      const response = await api.get<LoginEntry[]>(`/users/${userId}/logins`);

      const logins = Array.isArray(response.data) ? response.data : [];
      dispatch({ type: "SET_USER_LOGINS", payload: logins });
      console.log(`Pobrano i zapisano logowania dla użytkownika ${userId}`);
      return logins;
    } catch (error) {
      console.error("Błąd pobierania logowań:", error);
      toast.error("Nie udało się pobrać historii logowań.");
      throw error;
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      if (typeof window === "undefined") return;
  
      const token = localStorage.getItem("jwt_token");
      if (!token) {
        dispatch({ type: "SET_LOADING", payload: false });
        return;
      }
  
      try {
        
        const response = await api.get<User>(`/users/me/get`);
        dispatch({ type: "UPDATE_USER", payload: response.data });
        dispatch({ type: "SET_TOKEN", payload: token });
  
        
        const passwordHistory = sessionStorage.getItem(`passwords`);
        if (passwordHistory) {
          console.log("Przywracanie historii haseł z sesji");
          dispatch({ type: "SET_PASSWORDS", payload: JSON.parse(passwordHistory) });
        }
  
        
        const savedHistory = localStorage.getItem(`passwordHistory`);
        if (savedHistory) {
          console.log("Przywracanie historii haseł z localStorage");
          dispatch({ type: "SET_HISTORY", payload: JSON.parse(savedHistory) });
        }
  
        
        if (!state.zip && response.data.id) {
          const zipResponse = await api.get(`/passwords/${response.data.id}/files`, {
            responseType: "blob",
          });
          const loadedZip = await JSZip.loadAsync(zipResponse.data);
          dispatch({ type: "SET_ZIP", payload: loadedZip });
        }
  
        
        const masterkey = localStorage.getItem(`masterkey`);
        if (masterkey) {
          const decryptedMasterkey = await decryptMasterkey(masterkey, "123");
          const encryptionKey = await deriveEncryptionKeyFromMasterkey(decryptedMasterkey);
          dispatch({ type: "SET_ENCRYPTION_KEY", payload: encryptionKey });
        }
  
        
        setShouldFetchData(true);
        toast.success("Sesja przywrócona!", { duration: 2000 });
      } catch (error: any) {
        console.error("RestoreSession: Error restoring session:", error);
        toast.error("Błąd przywracania sesji. Zaloguj się ponownie.", {
          description: error.response?.data?.detail || "Nieznany błąd",
          duration: 3000,
        });
        if (error.response?.status === 401) {
          localStorage.removeItem("jwt_token");
          dispatch({ type: "LOGOUT" });
          window.location.href = "/login";
        }
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };
  
    restoreSession();
  }, []); 

  useEffect(() => {
    const fetchData = async () => {
      if (!shouldFetchData || !state.token || !state.currentUser) {
        return;
      }

      console.log("FetchData: Fetching data for user:", state.currentUser.id);
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const userId = state.currentUser.id;
        const [passwordsResponse, devicesResponse, userResponse, zipResponse, loginsResponse] = await Promise.all([
          api.get<PasswordTable[]>(`/passwords`),
          api.get<TrustedDevice[]>(`/users/${userId}/trusted-devices`),
          api.get<User>(`/users/${userId}`),
          api.get(`/passwords/${userId}/files`, {
            responseType: "blob",
          }),
          api.get<LoginEntry[]>(`/users/${userId}/logins`),
        ]);

        sessionStorage.setItem("passwords", JSON.stringify(passwordsResponse.data));
        sessionStorage.setItem("devices", JSON.stringify(devicesResponse.data));
        sessionStorage.setItem("user", JSON.stringify(userResponse.data));
        sessionStorage.setItem("logins", JSON.stringify(loginsResponse.data));

        const loadedZip = await JSZip.loadAsync(zipResponse.data);
        dispatch({
          type: "SET_DATA",
          payload: {
            passwords: passwordsResponse.data || [],
            trustedDevices: devicesResponse.data || [],
            currentUser: userResponse.data,
            zip: loadedZip,
          },
        });
        dispatch({ type: "SET_USER_LOGINS", payload: loginsResponse.data || [] });
        setShouldFetchData(false);
        toast.success("Dane użytkownika, urządzenia, ZIP i logowania zostały pobrane z API!");
      } catch (error) {
        console.error("FetchData: Error fetching data:", error);
        toast.error("Nie udało się pobrać danych z API.");
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    fetchData();
  }, [shouldFetchData, state.token, state.currentUser?.id]);

  /**
   * Kopiuje hasło do schowka po odszyfrowaniu z pliku ZIP i aktualizuje historię siły hasła.
   * @param passwordfile - Nazwa pliku hasła w ZIP.
   * @param platform - Nazwa platformy.
   * @param login - Login dla hasła.
   * @param onDecryptionFail - Opcjonalna funkcja wywoływana przy błędzie deszyfrowania.
   * @throws Error - Jeśli brak ZIP lub klucza szyfrowania, lub deszyfrowanie nie powiedzie się.
   */
  const copyToClipboard = async (passwordfile: string, platform: string, login: string, onDecryptionFail?: () => void) => {
    try {
      if (!state.zip) {
        throw new Error("ZIP nie jest dostępny");
      }
      if (!state.zip || !state.encryptionKey) {
        throw new Error("ZIP lub klucz szyfrowania nie jest dostępny");
      }
      const password = await extractPasswordFromZip(state.zip, passwordfile, state.encryptionKey);
      const strengthResult = zxcvbn(password);
      const strength = (strengthResult.score / 4) * 100;

      const historyEntry: PasswordHistory = {
        id: `${platform}-${login}`,
        platform,
        login,
        strength,
        timestamp: new Date().toISOString(),
      };
      dispatch({ type: "UPDATE_HISTORY", payload: historyEntry });

      await navigator.clipboard.writeText(password);
      toast.success("Sukces!", { description: `Hasło skopiowane. Siła: ${strength}%`, duration: 3000 });
    } catch (error) {
      console.error("Błąd kopiowania hasła:", error);
      if (onDecryptionFail) {
        onDecryptionFail();
      } else {
        toast.error("Błąd!", { description: "Wystąpił błąd podczas kopiowania. Podaj masterkey.", duration: 3000 });
      }
    }
  };

  /**
   * Dodaje nowe hasło, szyfrując je i wysyłając do API, oraz aktualizuje ZIP i historię.
   * @param password - Hasło do dodania.
   * @param platform - Nazwa platformy.
   * @param login - Login dla hasła.
   * @throws Error - Jeśli brak użytkownika, tokenu lub klucza szyfrowania, lub żądanie API nie powiedzie się.
   */
  const addPassword = async (password: string, platform: string, login: string) => {
    try {
      const userId = state.currentUser?.id;
      if (!userId || !state.token || !state.encryptionKey) throw new Error("Brak tokenu JWT, użytkownika lub klucza szyfrowania");

      const { encrypted, iv } = await encryptPassword(password, state.encryptionKey);
      const encryptedPassword = `${encrypted}:${iv}`;

      const response = await api.post<PasswordTable>(
        `/passwords/${userId}/files/`,
        { password: encryptedPassword, platform, login }
      );

      const strengthResult = zxcvbn(password);
      const strength = (strengthResult.score / 4) * 100;

      const zipResponse = await api.get(`/passwords/${userId}/files`, {
        responseType: "blob",
      });
      const updatedZip = await JSZip.loadAsync(zipResponse.data);

      dispatch({
        type: "SET_DATA",
        payload: {
          passwords: [...state.passwords, response.data],
          trustedDevices: state.trustedDevices,
          currentUser: state.currentUser!,
          zip: updatedZip,
        },
      });

      const historyEntry: PasswordHistory = {
        id: `${platform}-${login}`,
        platform,
        login,
        strength,
        timestamp: new Date().toISOString(),
      };
      dispatch({ type: "UPDATE_HISTORY", payload: historyEntry });

      toast.success("Hasło dodane!", { description: `Siła hasła: ${strength}%`, duration: 3000 });
    } catch (error) {
      console.error("Błąd dodawania hasła:", error);
      toast.error("Błąd!", { description: "Nie udało się dodać hasła.", duration: 3000 });
      throw error;
    }
  };

  /**
   * Aktualizuje istniejące hasło, szyfrując je i wysyłając do API, oraz aktualizuje ZIP i historię.
   * @param newPassword - Nowe hasło.
   * @param platform - Nazwa platformy.
   * @param login - Login dla hasła.
   * @throws Error - Jeśli brak użytkownika, tokenu lub klucza szyfrowania, lub żądanie API nie powiedzie się.
   */
  const updatePassword = async (newPassword: string, platform: string, login: string) => {
    try {
      const userId = state.currentUser?.id;
      if (!userId || !state.token || !state.encryptionKey) throw new Error("Brak tokenu JWT, użytkownika lub klucza szyfrowania");

      const { encrypted, iv } = await encryptPassword(newPassword, state.encryptionKey);
      const encryptedPassword = `${encrypted}:${iv}`;
      const platform2 = encodeURIComponent(platform);
      const login2 = encodeURIComponent(login);
      const response = await api.put<PasswordTable>(
        `/passwords/${userId}/passwords/${platform2}/${login2}`,
        { new_password: encryptedPassword },
      );

      const strengthResult = zxcvbn(newPassword);
      const strength = (strengthResult.score / 4) * 100;

      const zipResponse = await api.get(`/passwords/${userId}/files`, {
        responseType: "blob",
      });
      const updatedZip = await JSZip.loadAsync(zipResponse.data);

      dispatch({
        type: "SET_DATA",
        payload: {
          passwords: state.passwords.map((p) =>
            {
              if(p.platform === platform && p.login === login) console.log("Zaktualizowane hasło:", response.data);
              return p.platform === platform && p.login === login ? response.data : p}
          ),
          trustedDevices: state.trustedDevices,
          currentUser: state.currentUser!,
          zip: updatedZip,
        },
      });

      const historyEntry: PasswordHistory = {
        id: `${platform}-${login}`,
        platform,
        login,
        strength,
        timestamp: new Date().toISOString(),
      };
      dispatch({ type: "UPDATE_HISTORY", payload: historyEntry });

      toast.success("Hasło zaktualizowane!", { description: `Nowa siła hasła: ${strength}%`, duration: 3000 });
    } catch (error) {
      console.error("Błąd aktualizacji hasła:", error);
      toast.error("Błąd!", { description: "Nie udało się zaktualizować hasła.", duration: 3000 });
      throw error;
    }
  };

  /**
   * Usuwa hasło z API, aktualizuje stan i ZIP.
   * @param platform - Nazwa platformy.
   * @param login - Login dla hasła.
   * @throws Error - Jeśli brak użytkownika lub tokenu, lub żądanie API nie powiedzie się.
   */
  const deletePassword = async (platform: string, login: string) => {
    console.log(login);
    try {
      const userId = state.currentUser?.id;
      if (!userId || !state.token) throw new Error("Brak tokenu JWT lub niezalogowany użytkownik");
      const platform2 = encodeURIComponent(platform);
      const login2 = encodeURIComponent(login);
      await api.delete(`/passwords/${userId}/passwords/${platform2}/${login2}`);

      const zipResponse = await api.get(`/passwords/${userId}/files`, {
        responseType: "blob",
      });
      const updatedZip = await JSZip.loadAsync(zipResponse.data);

      dispatch({
        type: "SET_DATA",
        payload: {
          passwords: state.passwords.filter((p) => !(p.platform === platform && p.login === login)),
          trustedDevices: state.trustedDevices,
          currentUser: state.currentUser!,
          zip: updatedZip,
        },
      });

      toast.success("Hasło usunięte!", { description: `Rekord dla ${platform}/${login} został usunięty`, duration: 3000 });
    } catch (error) {
      console.error("Błąd usuwania hasła:", error);
      toast.error("Błąd!", { description: "Nie udało się usunąć hasła.", duration: 3000 });
      throw error;
    }
  };

  /**
   * Dodaje lub aktualizuje zaufane urządzenie w API i stanie.
   * @param device_id - ID urządzenia.
   * @param user_agent - Ciąg User-Agent urządzenia.
   * @param is_trusted - Status zaufania urządzenia.
   * @throws Error - Jeśli brak użytkownika lub tokenu, lub żądanie API nie powiedzie się.
   */
  const addOrUpdateTrustedDevice = async (device_id: string, user_agent: string, is_trusted: boolean) => {
    try {
      const userId = state.currentUser?.id;
      if (!userId || !state.token) throw new Error("Brak tokenu JWT lub niezalogowany użytkownik");

      const response = await api.patch<TrustedDevice>(
        `/users/${userId}/trusted-devices`,
        { device_id, user_agent, is_trusted },
      );

      dispatch({ type: "ADD_OR_UPDATE_DEVICE", payload: response.data });
      toast.success("Urządzenie zaktualizowane!", {
        description: `Status zaufania dla ${device_id}: ${is_trusted ? "Zaufane" : "Niezaufane"}`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Błąd aktualizacji urządzenia:", error);
      toast.error("Błąd!", { description: "Nie udało się zaktualizować urządzenia.", duration: 3000 });
      throw error;
    }
  };

  /**
   * Usuwa zaufane urządzenie z API i stanu.
   * @param device_id - ID urządzenia.
   * @throws Error - Jeśli brak użytkownika lub tokenu, lub żądanie API nie powiedzie się.
   */
  const deleteTrustedDevice = async (device_id: string) => {
    try {
      const userId = state.currentUser?.id;
      if (!userId || !state.token) throw new Error("Brak tokenu JWT lub niezalogowany użytkownik");

      await api.delete(`/users/${userId}/trusted-devices/${device_id}`);

      dispatch({ type: "DELETE_DEVICE", payload: { device_id } });
      toast.success("Urządzenie usunięte!", {
        description: `Urządzenie ${device_id} zostało usunięte z listy zaufanych.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Błąd usuwania urządzenia:", error);
      toast.error("Błąd!", { description: "Nie udało się usunąć urządzenia.", duration: 3000 });
      throw error;
    }
  };

  /**
   * Pobiera dane użytkownika z API i aktualizuje stan.
   * @param userId - ID użytkownika.
   * @throws Error - Jeśli brak tokenu lub żądanie API nie powiedzie się.
   */
  const getUser = async (userId: string) => {
    try {
      const token = state.token;
      if (!token) throw new Error("Brak tokenu JWT");

      const response = await api.get<User>(`/users/${userId}`);
      dispatch({ type: "UPDATE_USER", payload: response.data });
      toast.success("Dane użytkownika pobrane!", {
        description: `Pobrano dane dla użytkownika ${response.data.login}`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Błąd pobierania danych użytkownika:", error);
      toast.error("Błąd!", { description: "Nie udało się pobrać danych użytkownika.", duration: 3000 });
      throw error;
    }
  };

  /**
   * Dodaje nowego użytkownika do API i aktualizuje stan.
   * @param first_name - Imię użytkownika.
   * @param last_name - Nazwisko użytkownika.
   * @param login - Email użytkownika.
   * @param password - Hasło użytkownika.
   * @param token - Token reCAPTCHA.
   * @throws Error - Jeśli żądanie API nie powiedzie się.
   */
  const addUser = async (first_name: string, last_name: string, login: string, password: string, token: string) => {
    //console.log("Dodawanie użytkownika:", first_name, last_name, login, password, token);
    try {
      const response = await api.post<User>(`/users`, {
        first_name,
        last_name,
        login,
        password,
        token
      });
      const user = response.data;
      dispatch({ type: "ADD_USER", payload: user });

      

      toast.success("Użytkownik dodany!", {
        description: `Dodano użytkownika ${login} i zapisano masterkey.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Błąd dodawania użytkownika:", error);
      toast.error("Błąd!", { description: "Nie udało się dodać użytkownika lub zapisać masterkey.", duration: 3000 });
      throw error;
    }
  };

   /**
   * Ustawia Masterkey, generuje klucz szyfrowania i inicjuje pobieranie danych.
   * @param masterkey - Klucz główny do ustawienia.
   * @throws Error - Jeśli brak użytkownika lub tokenu, lub Masterkey jest nieprawidłowy.
   */
  const setMasterkey = async (masterkey: string) => {
    try {
      const userId = state.currentUser?.id;
      if (!userId || !state.token) {
        throw new Error("Brak użytkownika lub tokenu. Zaloguj się ponownie.");
      }

 
      const encryptionKey = await deriveEncryptionKeyFromMasterkey(masterkey);
      dispatch({ type: "SET_ENCRYPTION_KEY", payload: encryptionKey });

     
      if (!state.zip) {
        const zipResponse = await api.get(`/passwords/${userId}/files`, {
          responseType: "blob",
        });
        const loadedZip = await JSZip.loadAsync(zipResponse.data);
        dispatch({ type: "SET_ZIP", payload: loadedZip });
      }

     
      const encryptedMasterkey = await encryptMasterkey(masterkey, "123");
      localStorage.setItem(`masterkey`, encryptedMasterkey);

      
      if (state.passwords.length === 0) {
        setShouldFetchData(true);
      }

      toast.success("Masterkey ustawiony!", {
        description: "Dostęp do zaszyfrowanych danych został przywrócony.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Błąd ustawiania masterkey:", error);
      toast.error("Błąd!", {
        description: "Nieprawidłowy masterkey lub problem z deszyfrowaniem haseł.",
        duration: 3000,
      });
      throw error;
    }
  };

  /**
   * Aktualizuje dane użytkownika w API i stanie.
   * @param userId - ID użytkownika.
   * @param first_name - Nowe imię (opcjonalne).
   * @param last_name - Nowe nazwisko (opcjonalne).
   * @param login - Nowy email (opcjonalne).
   * @param password - Nowe hasło (opcjonalne).
   * @throws Error - Jeśli brak tokenu lub żądanie API nie powiedzie się.
   */
  const updateUser = async (
    userId: string,
    first_name?: string,
    last_name?: string,
    login?: string,
    password?: string
  ) => {
    try {
      const token = state.token;
      if (!token) throw new Error("Brak tokenu JWT");

      const response = await api.patch<User>(
        `/users/${userId}`,
        { first_name, last_name, login, password }
      );
      dispatch({ type: "UPDATE_USER", payload: response.data });


      toast.success("Dane użytkownika zaktualizowane!", {
        description: `Zaktualizowano dane dla użytkownika ${response.data.login}`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Błąd aktualizacji użytkownika:", error);
      toast.error("Błąd!", { description: "Nie udało się zaktualizować danych użytkownika.", duration: 3000 });
      throw error;
    }
  };

   /**
   * Pobiera listę haseł z API i aktualizuje stan.
   * @throws Error - Jeśli brak tokenu lub żądanie API nie powiedzie się.
   */
  const fetchPasswords = async () => {
    if (!state.token) {
      toast.error("Błąd!", { description: "Brak tokenu autoryzacyjnego. Zaloguj się ponownie.", duration: 3000 });
      return;
    }
    console.log("Fetching passwords from API...");
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await api.get<PasswordTable[]>(`/passwords`);
      const passwords = response.data || [];
      dispatch({ type: "SET_PASSWORDS", payload: passwords });
      sessionStorage.setItem("passwords", JSON.stringify(passwords)); // Optionally update session storage
      console.log("Passwords fetched and set successfully.");
      // Optional: Add a success toast if needed, though it might be noisy if called often
      // toast.success("Lista haseł zaktualizowana!", { duration: 2000 });
    } catch (error) {
      console.error("Błąd pobierania listy haseł:", error);
      toast.error("Błąd!", { description: "Nie udało się pobrać listy haseł z API.", duration: 3000 });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  return (
    <PasswordContext.Provider
      value={{
        state,
        copyToClipboard,
        addPassword,
        updatePassword,
        deletePassword,
        addOrUpdateTrustedDevice,
        deleteTrustedDevice,
        getUser,
        addUser,
        updateUser,
        setToken,
        logout,
        getUserLogins,
        login,
        setMasterkey,
        fetchPasswords,
      }}
    >
      {children}
    </PasswordContext.Provider>
  );
};

/**
 * Hook do korzystania z kontekstu haseł.
 * @returns Kontekst haseł.
 */
export const usePasswordContext = () => {
  const context = useContext(PasswordContext);
  if (!context) {
    throw new Error("usePasswordContext musi być użyty w PasswordProvider");
  }
  return context;
};

/**
 * Typ kontekstu haseł.
 */
type PasswordContextType = {
  state: PasswordState;
  copyToClipboard: (passwordfile: string, platform: string, login: string, onDecryptionFail?: () => void) => Promise<void>;
  addPassword: (password: string, platform: string, login: string) => Promise<void>;
  updatePassword: (newPassword: string, platform: string, login: string) => Promise<void>;
  deletePassword: (platform: string, login: string) => Promise<void>;
  addOrUpdateTrustedDevice: (device_id: string, user_agent: string, is_trusted: boolean) => Promise<void>;
  deleteTrustedDevice: (device_id: string) => Promise<void>;
  getUser: (userId: string) => Promise<void>;
  addUser: (first_name: string, last_name: string, login: string, password: string, token: string) => Promise<void>;
  updateUser: (userId: string, first_name?: string, last_name?: string, login?: string, password?: string) => Promise<void>;
  setToken: (token: string | null) => void;
  logout: () => void;
  getUserLogins: (userId: string) => Promise<LoginEntry[]>;
  login: (login: string, password: string, masterkey: string, token2: string) => Promise<void>;
  setMasterkey: (masterkey: string) => Promise<void>;
  fetchPasswords: () => Promise<void>;
};

const PasswordContext = createContext<PasswordContextType | undefined>(undefined);
