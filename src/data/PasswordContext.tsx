"use client";

import React, { createContext, useContext, useReducer, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import JSZip from "jszip";
import zxcvbn from "zxcvbn";

export type PasswordTable = {
  id: string;
  passwordfile: string;
  logo: string;
  platform: string;
  login: string;
};

export type PasswordHistory = {
  id: string;
  platform: string;
  login: string;
  strength: number;
  timestamp: string;
};

export type TrustedDevice = {
  user_id: string;
  device_id: string;
  user_agent: string;
  is_trusted: boolean;
};

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  login: string;
  password: string;
};

export type LoginEntry = {
  timestamp: string;
  user_id: string;
  login: string;
  page: string;
};

type PasswordState = {
  passwords: PasswordTable[];
  history: PasswordHistory[];
  trustedDevices: TrustedDevice[];
  currentUser: User | null;
  zip: JSZip | null;
  loading: boolean;
  token: string | null;
  userLogins: LoginEntry[];
};

type PasswordAction =
  | { type: "SET_DATA"; payload: { passwords: PasswordTable[]; trustedDevices: TrustedDevice[]; currentUser: User; zip: JSZip } }
  | { type: "SET_LOADING"; payload: boolean }
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
  | { type: "SET_HISTORY"; payload: PasswordHistory[] };

const passwordReducer = (state: PasswordState, action: PasswordAction): PasswordState => {
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
        localStorage.setItem(`passwordHistory_${state.currentUser.id}`, JSON.stringify(newHistory));
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
        localStorage.setItem(`passwordHistory_${state.currentUser.id}`, JSON.stringify(state.history));
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
      };
    case "SET_USER_LOGINS":
      return { ...state, userLogins: action.payload };
    case "SET_HISTORY":
      return { ...state, history: action.payload };
    default:
      return state;
  }
};

type PasswordContextType = {
  state: PasswordState;
  copyToClipboard: (passwordfile: string, platform: string, login: string) => Promise<void>;
  addPassword: (password: string, platform: string, login: string) => Promise<void>;
  updatePassword: (newPassword: string, platform: string, login: string) => Promise<void>;
  deletePassword: (platform: string, login: string) => Promise<void>;
  addOrUpdateTrustedDevice: (device_id: string, user_agent: string, is_trusted: boolean) => Promise<void>;
  deleteTrustedDevice: (device_id: string) => Promise<void>;
  getUser: (userId: string) => Promise<void>;
  addUser: (first_name: string, last_name: string, login: string, password: string) => Promise<void>;
  updateUser: (userId: string, first_name?: string, last_name?: string, login?: string, password?: string) => Promise<void>;
  setToken: (token: string | null) => void;
  logout: () => void;
  getUserLogins: (userId: string) => Promise<LoginEntry[]>;
  login: (login: string, password: string) => Promise<void>;
};

const PasswordContext = createContext<PasswordContextType | undefined>(undefined);

const extractPasswordFromZip = async (zip: JSZip, filename: string) => {
  const file = zip.file(filename);
  if (!file) throw new Error("Plik nie znaleziony w ZIP");
  return file.async("string").then((text) => text.trim());
};

export const PasswordProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(passwordReducer, {
    passwords: [],
    history: [],
    trustedDevices: [],
    currentUser: null,
    zip: null,
    loading: true,
    token: localStorage.getItem("jwt_token") || null,
    userLogins: [],
  });

  const [sessionRestored, setSessionRestored] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

  const setToken = (token: string | null) => {
    dispatch({ type: "SET_TOKEN", payload: token });
    if (token) {
      localStorage.setItem("jwt_token", token);
    } else {
      localStorage.removeItem("jwt_token");
    }
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
    setDataFetched(false);
    toast.success("Wylogowano pomyślnie!", { duration: 3000 });
    window.location.href = "/login";
  };

  const login = async (login: string, password: string) => {
    try {
      const response = await axios.post<{ user: User; token: string }>("http://127.0.0.1:5000/login", {
        login,
        password,
      });
      const { user, token } = response.data;
      setToken(token);
      dispatch({ type: "UPDATE_USER", payload: user });
      const savedHistory = localStorage.getItem(`passwordHistory_${user.id}`);
      if (savedHistory) {
        dispatch({ type: "SET_HISTORY", payload: JSON.parse(savedHistory) });
      }
      toast.success("Zalogowano pomyślnie!", {
        description: `Witaj, ${user.first_name} ${user.last_name}!`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Błąd logowania:", error);
      toast.error("Błąd logowania!", { description: "Nieprawidłowy login lub hasło.", duration: 3000 });
      throw error;
    }
  };

  const getUserLogins = async (userId: string): Promise<LoginEntry[]> => {
    try {
      const cachedLogins = state.userLogins.filter((entry) => entry.user_id === userId);
      if (cachedLogins.length > 0) {
        console.log(`Zwracam zapisane logowania dla użytkownika ${userId} z pamięci podręcznej`);
        return cachedLogins;
      }

      const token = state.token;
      if (!token) throw new Error("Brak tokenu JWT");

      const response = await axios.get<LoginEntry[]>(`http://127.0.0.1:5000/users/${userId}/logins`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      dispatch({ type: "SET_USER_LOGINS", payload: response.data });
      console.log(`Pobrano i zapisano logowania dla użytkownika ${userId}`);
      return response.data;
    } catch (error) {
      console.error("Błąd pobierania logowań:", error);
      toast.error("Nie udało się pobrać historii logowań.");
      throw error;
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("jwt_token");
      if (!token) {
        dispatch({ type: "SET_LOADING", payload: false });
        setSessionRestored(true);
        return;
      }

      try {
        const response = await axios.get<User>("http://127.0.0.1:5000/users/me/get", {
          headers: { Authorization: `Bearer ${token}` },
        });
        dispatch({ type: "UPDATE_USER", payload: response.data });
        dispatch({ type: "SET_TOKEN", payload: token });
        const savedHistory = localStorage.getItem(`passwordHistory_${response.data.id}`);
        if (savedHistory) {
          dispatch({ type: "SET_HISTORY", payload: JSON.parse(savedHistory) });
        }
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
        }
      } finally {
        setSessionRestored(true);
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    restoreSession();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!sessionRestored || !state.token || !state.currentUser || dataFetched) {
        return;
      }

      console.log("FetchData: Fetching data for user:", state.currentUser.id);
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const userId = state.currentUser.id;
        const [passwordsResponse, devicesResponse, userResponse, zipResponse, loginsResponse] = await Promise.all([
          axios.get<PasswordTable[]>("http://127.0.0.1:5000/passwords", {
            headers: { Authorization: `Bearer ${state.token}` },
          }),
          axios.get<TrustedDevice[]>(`http://127.0.0.1:5000/users/${userId}/trusted-devices`, {
            headers: { Authorization: `Bearer ${state.token}` },
          }),
          axios.get<User>(`http://127.0.0.1:5000/users/${userId}`, {
            headers: { Authorization: `Bearer ${state.token}` },
          }),
          axios.get(`http://127.0.0.1:5000/users/${userId}/files`, {
            responseType: "blob",
            headers: { Authorization: `Bearer ${state.token}` },
          }),
          axios.get<LoginEntry[]>(`http://127.0.0.1:5000/users/${userId}/logins`, {
            headers: { Authorization: `Bearer ${state.token}` },
          }),
        ]);

        const loadedZip = await JSZip.loadAsync(zipResponse.data);
        dispatch({
          type: "SET_DATA",
          payload: {
            passwords: passwordsResponse.data,
            trustedDevices: devicesResponse.data,
            currentUser: userResponse.data,
            zip: loadedZip,
          },
        });
        dispatch({ type: "SET_USER_LOGINS", payload: loginsResponse.data });
        setDataFetched(true);
        toast.success("Dane użytkownika, urządzenia, ZIP i logowania zostały pobrane z API!");
      } catch (error) {
        console.error("FetchData: Error fetching data:", error);
        toast.error("Nie udało się pobrać danych z API.");
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    fetchData();
  }, [sessionRestored, state.token, state.currentUser, dataFetched]);

  const copyToClipboard = async (passwordfile: string, platform: string, login: string) => {
    try {
      if (!state.zip) throw new Error("ZIP nie został jeszcze pobrany");
      const password = await extractPasswordFromZip(state.zip, passwordfile);
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
      toast.error("Błąd!", { description: "Wystąpił błąd podczas kopiowania.", duration: 3000 });
    }
  };

  const addPassword = async (password: string, platform: string, login: string) => {
    try {
      const userId = state.currentUser?.id;
      if (!userId || !state.token) throw new Error("Brak tokenu JWT lub niezalogowany użytkownik");

      const response = await axios.post<PasswordTable>(
        `http://127.0.0.1:5000/users/${userId}/files/`,
        { password, platform, login },
        { headers: { Authorization: `Bearer ${state.token}` } }
      );

      const strengthResult = zxcvbn(password);
      const strength = (strengthResult.score / 4) * 100;

      const zipResponse = await axios.get(`http://127.0.0.1:5000/users/${userId}/files`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${state.token}` },
      });
      const updatedZip = await JSZip.loadAsync(zipResponse.data);

      dispatch({ type: "ADD_PASSWORD", payload: response.data });
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

  const updatePassword = async (newPassword: string, platform: string, login: string) => {
    try {
      const userId = state.currentUser?.id;
      if (!userId || !state.token) throw new Error("Brak tokenu JWT lub niezalogowany użytkownik");

      const response = await axios.put<PasswordTable>(
        `http://127.0.0.1:5000/users/${userId}/passwords/${platform}/${login}`,
        { new_password: newPassword },
        { headers: { Authorization: `Bearer ${state.token}` } }
      );

      const strengthResult = zxcvbn(newPassword);
      const strength = (strengthResult.score / 4) * 100;

      const zipResponse = await axios.get(`http://127.0.0.1:5000/users/${userId}/files`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${state.token}` },
      });
      const updatedZip = await JSZip.loadAsync(zipResponse.data);

      dispatch({ type: "UPDATE_PASSWORD", payload: response.data });
      dispatch({
        type: "SET_DATA",
        payload: {
          passwords: state.passwords.map((p) =>
            p.platform === platform && p.login === login ? response.data : p
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

  const deletePassword = async (platform: string, login: string) => {
    try {
      const userId = state.currentUser?.id;
      if (!userId || !state.token) throw new Error("Brak tokenu JWT lub niezalogowany użytkownik");

      await axios.delete(`http://127.0.0.1:5000/users/${userId}/passwords/${platform}/${login}`, {
        headers: { Authorization: `Bearer ${state.token}` },
      });

      const zipResponse = await axios.get(`http://127.0.0.1:5000/users/${userId}/files`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${state.token}` },
      });
      const updatedZip = await JSZip.loadAsync(zipResponse.data);

      dispatch({ type: "DELETE_PASSWORD", payload: { platform, login } });
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

  const addOrUpdateTrustedDevice = async (device_id: string, user_agent: string, is_trusted: boolean) => {
    try {
      const userId = state.currentUser?.id;
      if (!userId || !state.token) throw new Error("Brak tokenu JWT lub niezalogowany użytkownik");

      const response = await axios.patch<TrustedDevice>(
        `http://127.0.0.1:5000/users/${userId}/trusted-devices`,
        { device_id, user_agent, is_trusted },
        { headers: { Authorization: `Bearer ${state.token}` } }
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

  const deleteTrustedDevice = async (device_id: string) => {
    try {
      const userId = state.currentUser?.id;
      if (!userId || !state.token) throw new Error("Brak tokenu JWT lub niezalogowany użytkownik");

      await axios.delete(`http://127.0.0.1:5000/users/${userId}/trusted-devices/${device_id}`, {
        headers: { Authorization: `Bearer ${state.token}` },
      });

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

  const getUser = async (userId: string) => {
    try {
      const token = state.token;
      if (!token) throw new Error("Brak tokenu JWT");

      const response = await axios.get<User>(`http://127.0.0.1:5000/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const addUser = async (first_name: string, last_name: string, login: string, password: string) => {
    try {
      const response = await axios.post<User>("http://127.0.0.1:5000/users", {
        first_name,
        last_name,
        login,
        password,
      });
      dispatch({ type: "ADD_USER", payload: response.data });
      toast.success("Użytkownik dodany!", {
        description: `Dodano użytkownika ${login}`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Błąd dodawania użytkownika:", error);
      toast.error("Błąd!", { description: "Nie udało się dodać użytkownika.", duration: 3000 });
      throw error;
    }
  };

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

      const response = await axios.patch<User>(`http://127.0.0.1:5000/users/${userId}`, {
        first_name,
        last_name,
        login,
        password,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      }}
    >
      {children}
    </PasswordContext.Provider>
  );
};

export const usePasswordContext = () => {
  const context = useContext(PasswordContext);
  if (!context) {
    throw new Error("usePasswordContext musi być użyty w PasswordProvider");
  }
  return context;
};