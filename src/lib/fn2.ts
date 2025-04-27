import { decryptMasterkey, decryptPassword, deriveEncryptionKeyFromMasterkey, encryptMasterkey, encryptPassword, PasswordTable, User } from "@/data/PasswordContext";
import axios from "axios";
import JSZip from "jszip";

export async function updateMasterKey(oldMasterkey: string, newMasterkey: string, token: string | null, currentUser : User | null, passwords : PasswordTable[]) {
      if (!currentUser ||  !token) {
        throw new Error("Brak danych użytkownika lub tokenu.");
      }
      const [zipResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/passwords/${currentUser.id}/files`, {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
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
  
       await axios.put(
        `${import.meta.env.VITE_API_URL}/passwords/${currentUser.id}/passwords`,
        { passwordsall: encryptedPasswords },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const newEncryptedMasterkey = await encryptMasterkey(newMasterkey, currentUser.password);
      localStorage.setItem(`masterkey`, newEncryptedMasterkey);
    }

export const resetPasswordSubmit = async (email : string) => {
      await axios.post(`${import.meta.env.VITE_API_URL}/users/reset-password/`,{
        "login": email
      });
    }


   export const resetPasswordFn = async (resetToken: string | undefined, newPassword: any) => {
      return await axios.post(
        `${import.meta.env.VITE_API_URL}/users/reset-password/confirm`,
        {
          resetToken: resetToken,
          newPassword: newPassword,
        }
      );
     } 