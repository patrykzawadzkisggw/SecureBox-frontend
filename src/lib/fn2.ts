import { decryptMasterkey, decryptPassword, deriveEncryptionKeyFromMasterkey, encryptMasterkey, encryptPassword, PasswordTable, User } from "@/data/PasswordContext";
import axios from "axios";
import JSZip from "jszip";
import api from "./api";

/**
 * Aktualizuje Masterkey użytkownika, ponownie szyfrując wszystkie hasła nowym kluczem.
 * Pobiera zaszyfrowane hasła z serwera, odszyfrowuje je starym Masterkey, szyfruje nowym Masterkey i aktualizuje na serwerze.
 * Zapisuje nowy zaszyfrowany Masterkey w `localStorage`.
 *
 * @function updateMasterKey
 * @param {string} oldMasterkey - Aktualny Masterkey użytkownika.
 * @param {string} newMasterkey - Nowy Masterkey do ustawienia.
 * @param {string | null} token - Token uwierzytelniający użytkownika.
 * @param {User | null} currentUser - Obiekt użytkownika z danymi (np. `id`, `password`).
 * @param {PasswordTable[]} passwords - Lista haseł użytkownika z metadanymi (np. `platform`, `login`, `passwordfile`).
 * @throws {Error} Jeśli brak danych użytkownika, tokenu, Masterkey, lub jeśli stare Masterkey jest nieprawidłowe, lub nie uda się załadować plików.
 * @returns {Promise<void>} Po pomyślnej aktualizacji Masterkey i haseł.
 *
 * @example
 * ```tsx
 * import { updateMasterKey } from "@/lib/api";
 * import { usePasswordContext } from "@/data/PasswordContext";
 *
 * const ChangeMasterKey = () => {
 *   const { state } = usePasswordContext();
 *   const handleChange = async () => {
 *     await updateMasterKey("oldKey", "newKey", state.token, state.user, state.passwords);
 *   };
 *   return <button onClick={handleChange}>Zmień Masterkey</button>;
 * };
 * ```
 *
 * @remarks
 * - **Zależności**: Wymaga funkcji kryptograficznych (`decryptMasterkey`, `encryptMasterkey`, `deriveEncryptionKeyFromMasterkey`, `decryptPassword`, `encryptPassword`), typów `PasswordTable` i `User` z `PasswordContext`, `axios`, `JSZip`, oraz klienta `api`.
 * - **Proces**:
 *   - Weryfikuje dane użytkownika i token.
 *   - Pobiera zaszyfrowane hasła z serwera jako plik ZIP.
 *   - Odszyfrowuje stary Masterkey z `localStorage` (używając hasła `"123"`).
 *   - Sprawdza poprawność starego Masterkey.
 *   - Odszyfrowuje hasła starym kluczem, szyfruje je nowym kluczem i aktualizuje na serwerze.
 *   - Zapisuje nowy zaszyfrowany Masterkey w `localStorage`.
 * - **Bezpieczeństwo**:
 *   - Hasło `"123"` do odszyfrowania Masterkey jest zakodowane na stałe, co stanowi poważne ryzyko. Zastąp dynamicznym kluczem lub hasłem użytkownika.
 *   - Dane w `localStorage` (`masterkey`) są wrażliwe; rozważ bezpieczniejsze przechowywanie (np. HTTP-only cookies).
 *   - API powinno weryfikować token i ograniczać dostęp do `passwords/:id/files` oraz `passwords/:id/passwords`.
 * - **Testowanie**: Mockuj `api`, `JSZip`, i funkcje kryptograficzne. Testuj sukces, błędy (np. nieprawidłowy Masterkey, brak pliku ZIP), oraz aktualizację `localStorage`.
 * - **Uwagi**:
 *   - Funkcja zakłada, że wszystkie hasła są dostępne w ZIP-ie; brak pliku powoduje błąd.
 *   - Aktualizacja Masterkey jest operacją krytyczną; rozważ dodanie potwierdzenia użytkownika.
 */
export async function updateMasterKey(oldMasterkey: string, newMasterkey: string, token: string | null, currentUser : User | null, passwords : PasswordTable[]) {
      if (!currentUser ||  !token) {
        throw new Error("Brak danych użytkownika lub tokenu.");
      }
      const [zipResponse] = await Promise.all([
        api.get(`/passwords/${currentUser.id}/files`, {
          responseType: "blob",
        })
      ]);
  
      const loadedZip = await JSZip.loadAsync(zipResponse.data);
        if (!loadedZip) {
            throw new Error("Nie udało się załadować plików z serwera.");
        }
  
      const encryptedMasterkey = localStorage.getItem(`masterkey`);
      if (!encryptedMasterkey) {
        throw new Error("Brak masterkey w localStorage.");
      }
      const decryptedOldMasterkey = await decryptMasterkey(encryptedMasterkey, "123");
      if (decryptedOldMasterkey !== oldMasterkey) {
        throw new Error("Podane stare masterkey jest nieprawidłowe.");
      }
  
      const oldEncryptionKey = await deriveEncryptionKeyFromMasterkey(oldMasterkey);
  
      const passwordsToUpdate = [];
      for (const passwordEntry of passwords) {
        const encryptedData = await loadedZip.file(passwordEntry.passwordfile)?.async("string");
        if (!encryptedData) {
          throw new Error(`Nie znaleziono pliku ${passwordEntry.passwordfile} w ZIP-ie`);
        }
        const [encrypted, iv] = encryptedData.split(":");
        const decryptedPassword = await decryptPassword(encrypted, iv, oldEncryptionKey);
        passwordsToUpdate.push({
          platform: passwordEntry.platform,
          login: passwordEntry.login,
          new_password: decryptedPassword,
        });
      }
  
      const newEncryptionKey = await deriveEncryptionKeyFromMasterkey(newMasterkey);
      const encryptedPasswords = await Promise.all(
        passwordsToUpdate.map(async (entry) => {
          const { encrypted, iv } = await encryptPassword(entry.new_password, newEncryptionKey);
          return {
            platform: entry.platform,
            login: entry.login,
            new_password: `${encrypted}:${iv}`,
          };
        })
      );
  
       await api.put(
        `/passwords/${currentUser.id}/passwords`,
        { passwordsall: encryptedPasswords },
      );
      
      const newEncryptedMasterkey = await encryptMasterkey(newMasterkey, currentUser.password);
      localStorage.setItem(`masterkey`, newEncryptedMasterkey);
    }

/**
 * Wysyła żądanie resetowania hasła dla podanego adresu email z tokenem reCAPTCHA.
 *
 * @function resetPasswordSubmit
 * @param {string} email - Adres email użytkownika.
 * @param {string} token - Token reCAPTCHA dla weryfikacji.
 * @throws {Error} Jeśli żądanie API nie powiedzie się.
 * @returns {Promise<void>} Po pomyślnym wysłaniu żądania resetowania.
 *
 * @example
 * ```tsx
 * import { resetPasswordSubmit } from "@/lib/api";
 *
 * const handleReset = async (email: string, recaptchaToken: string) => {
 *   await resetPasswordSubmit(email, recaptchaToken);
 *   alert("Link do resetowania hasła wysłany!");
 * };
 * ```
 *
 * @remarks
 * - **Zależności**: Wymaga klienta `api` (prawdopodobnie instancja Axios).
 * - **Proces**: Wysyła żądanie POST do `/users/reset-password/` z email i tokenem reCAPTCHA.
 * - **Bezpieczeństwo**:
 *   - Token reCAPTCHA powinien być zweryfikowany po stronie serwera przez Google API.
 *   - Email powinien być walidowany serwer-side, aby zapobiec nadużyciom.
 * - **Testowanie**: Mockuj `api.post` i testuj sukces oraz błędy (np. nieprawidłowy email, brak tokena).
 * - **Uwagi**: Funkcja nie zwraca danych odpowiedzi API; rozważ zwracanie statusu lub komunikatu dla lepszej UX.
 */
export const resetPasswordSubmit = async (email : string, token: string) => {
      await api.post(`/users/reset-password/`,{
        "login": email,
        "token": token
      });
    }

/**
 * Potwierdza resetowanie hasła, wysyłając nowy hasło i token resetowania.
 *
 * @function resetPasswordFn
 * @param {string | undefined} resetToken - Token resetowania hasła.
 * @param {any} newPassword - Nowe hasło użytkownika.
 * @throws {Error} Jeśli żądanie API nie powiedzie się.
 * @returns {Promise<AxiosResponse>} Odpowiedź API po potwierdzeniu resetowania.
 *
 * @example
 * ```tsx
 * import { resetPasswordFn } from "@/lib/api";
 *
 * const handleConfirm = async (token: string, password: string) => {
 *   await resetPasswordFn(token, password);
 *   alert("Hasło zresetowane!");
 * };
 * ```
 *
 * @remarks
 * - **Zależności**: Wymaga klienta `api`.
 * - **Proces**: Wysyła żądanie POST do `/users/reset-password/confirm` z tokenem resetowania i nowym hasłem.
 * - **Bezpieczeństwo**:
 *   - `resetToken` powinien być walidowany serwer-side (np. sprawdzanie ważności i powiązania z użytkownikiem).
 *   - `newPassword` typu `any` jest ryzykownym wyborem; zmień na `string` dla bezpieczeństwa typów.
 *   - Hasło powinno być hashowane serwer-side (np. bcrypt).
 * - **Testowanie**: Mockuj `api.post` i testuj sukces oraz błędy (np. nieważny token, słabe hasło).
 * - **Uwagi**:
 *   - Funkcja zwraca odpowiedź Axios, co pozwala na obsługę danych odpowiedzi (np. komunikat sukcesu).
 *   - Rozważ dodanie walidacji hasła po stronie klienta przed wysłaniem.
 */
export const resetPasswordFn = async (resetToken: string | undefined, newPassword: any) => {
      return await api.post(
        `/users/reset-password/confirm`,
        {
          resetToken: resetToken,
          newPassword: newPassword,
        }
      );
     } 