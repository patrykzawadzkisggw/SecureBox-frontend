import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { PasswordTable } from "../data/PasswordContext";
import { toast } from "sonner";

/**
 * Obsługuje zmianę pliku JSON w celu importu haseł.
 * Sprawdza poprawność danych w pliku JSON i wywołuje funkcje `addPassword` lub `updatePassword` w zależności od tego, czy hasło już istnieje.
 * Wyświetla powiadomienia o sukcesie lub błędzie za pomocą biblioteki `sonner`.
 * @function handleFileChange
 * @param {React.ChangeEvent<HTMLInputElement>} event - Zdarzenie zmiany pliku w elemencie input.
 * @param {PasswordTable[]} passwords - Lista istniejących haseł z kontekstu.
 * @param {(password: string, platform: string, login: string) => Promise<void>} addPassword - Funkcja do dodawania nowego hasła.
 * @param {(password: string, platform: string, login: string) => Promise<void>} updatePassword - Funkcja do aktualizacji istniejącego hasła.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setIsImporting - Funkcja ustawiająca stan importowania.
 * @param {() => Promise<void>} [fetchPasswords] - Opcjonalna funkcja do pobrania haseł po zakończeniu importu.
 * @returns {Promise<void>} Obietnica resolves po zakończeniu importu lub reject w przypadku błędu.
 * @throws {Error} Jeśli plik JSON nie zawiera tablicy obiektów.
 * @example
 * ```tsx
 * const fileInput = document.createElement("input");
 * fileInput.type = "file";
 * fileInput.onchange = (e) => handleFileChange(e, passwords, addPassword, updatePassword, setIsImporting);
 * fileInput.click();
 * ```
 */
export const handleFileChange = async (
  event: React.ChangeEvent<HTMLInputElement>,
  passwords: PasswordTable[],
  addPassword: (password: string, platform: string, login: string) => Promise<void>,
  updatePassword: (password: string, platform: string, login: string) => Promise<void>,
  setIsImporting: React.Dispatch<React.SetStateAction<boolean>>,
  fetchPasswords?: () => Promise<void>
): Promise<void> => {
  const file = event.target.files?.[0];
  if (!file) return;

  setIsImporting(true);
  try {
    const text = await file.text();
    const jsonData = JSON.parse(text);

    if (!Array.isArray(jsonData)) {
      throw new Error("Plik JSON musi zawierać tablicę obiektów");
    }

    for (const entry of jsonData) {
      if (!entry.platform || !entry.login || !entry.password) {
        console.warn(`Pomijam nieprawidłowy wpis: ${JSON.stringify(entry)}`);
        continue;
      }

      const existingEntry = passwords.find(
        (p) => p.platform === entry.platform && p.login === entry.login
      );

      if (existingEntry) {
        await updatePassword(entry.password, entry.platform, entry.login);
      } else {
        await addPassword(entry.password, entry.platform, entry.login);
      }
    }
    if(fetchPasswords) await fetchPasswords();
    toast.success("Import zakończony!", {
      description: "Hasła zostały zaimportowane z pliku JSON.",
      duration: 3000,
    });
  } catch (error) {
    console.error("Błąd podczas importu z JSON:", error);
    toast.error("Błąd!", {
      description: "Nie udało się zaimportować haseł z JSON.",
      duration: 3000,
    });
  } finally {
    setIsImporting(false);
    event.target.value = "";
  }
};

/**
 * Komponent umożliwiający importowanie haseł użytkownika z pliku JSON.
 * Renderuje przycisk z ikoną, który otwiera okno wyboru pliku JSON. Po wybraniu pliku wywołuje funkcję `handleFileChange` do przetworzenia danych.
 * Wyświetla powiadomienia o sukcesie lub błędzie za pomocą biblioteki `sonner`.
 * @function ImportFromJSON
 * @param {Object} props - Właściwości komponentu.
 * @param {(password: string, platform: string, login: string) => Promise<void>} props.addPassword - Funkcja do dodawania nowego hasła.
 * @param {(newPassword: string, platform: string, login: string) => Promise<void>} props.updatePassword - Funkcja do aktualizacji istniejącego hasła.
 * @param {boolean} props.loading - Stan wskazujący, czy trwa ładowanie danych.
 * @param {PasswordTable[]} props.passwords - Lista istniejących haseł.
 * @returns {JSX.Element} Przycisk z ukrytym inputem do importowania haseł z pliku JSON.
 * @example
 * ```tsx
 * import ImportFromJSON from '@/components/ImportFromJSON';
 * const passwords = [{ id: "1", platform: "example", login: "user", passwordfile: "pass1.txt", logo: "" }];
 * const addPassword = async (password, platform, login) => { ... };
 * const updatePassword = async (password, platform, login) => { ... };
 * <ImportFromJSON addPassword={addPassword} updatePassword={updatePassword} loading={false} passwords={passwords} />
 * ```
 * @see {handleFileChange} - Funkcja obsługująca import
 */
export default function ImportFromJSON({addPassword, updatePassword, loading, passwords, fetchPasswords} : {addPassword: (password: string, platform: string, login: string) => Promise<void>, updatePassword: (newPassword: string, platform: string, login: string) => Promise<void>, loading: boolean, passwords: PasswordTable[], fetchPasswords?: () => Promise<void>}) {
  const [isImporting, setIsImporting] = useState(false);

  return (
    <label htmlFor="json-import" className="flex">
      <Button
        variant="outline"
        className="flex items-center gap-2 cursor-pointer select-none"
        disabled={isImporting || loading}
        asChild
      >
        <div>
          <Upload className="w-4 h-4" />
          {isImporting ? "Importowanie..." : "Importuj z JSON"}
        </div>
      </Button>
      <input
        id="json-import"
        type="file"
        accept=".json"
        className="hidden"
        onChange={(event) => handleFileChange(event, passwords, addPassword, updatePassword, setIsImporting, fetchPasswords)}
        disabled={isImporting || loading}
        data-testid="json-import-input"
      />
    </label>
  );
}