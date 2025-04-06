import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { usePasswordContext } from "../data/PasswordContext";
import { toast } from "sonner";

/**
 * Obsługuje zmianę pliku JSON.
 * Sprawdza poprawność danych i wywołuje funkcje `addPassword` oraz `updatePassword` z kontekstu.
 * @function handleFileChange
 * @param {React.ChangeEvent<HTMLInputElement>} event - Zdarzenie zmiany pliku.
 * @param {ReturnType<typeof usePasswordContext>["state"]} state - Stan kontekstu haseł.
 * @param {Function} addPassword - Funkcja z kontekstu do dodawania hasła.
 * @param {Function} updatePassword - Funkcja z kontekstu do aktualizacji hasła.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setIsImporting - Funkcja ustawiająca stan importowania.
 * @returns {Promise<void>} Obietnica resolves po zakończeniu importu lub reject w przypadku błędu.
 * @example
 * ```tsx
 * const fileInput = document.createElement("input");
 * fileInput.type = "file";
 * fileInput.onchange = (e) => handleFileChange(e, state, addPassword, updatePassword, setIsImporting);
 * ```
 */
export const handleFileChange = async (
  event: React.ChangeEvent<HTMLInputElement>,
  state: ReturnType<typeof usePasswordContext>["state"],
  addPassword: (password: string, platform: string, login: string) => Promise<void>,
  updatePassword: (password: string, platform: string, login: string) => Promise<void>,
  setIsImporting: React.Dispatch<React.SetStateAction<boolean>>
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

      const existingEntry = state.passwords.find(
        (p) => p.platform === entry.platform && p.login === entry.login
      );

      if (existingEntry) {
        await updatePassword(entry.password, entry.platform, entry.login);
      } else {
        await addPassword(entry.password, entry.platform, entry.login);
      }
    }

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
 * Komponent ImportFromJSON umożliwia importowanie haseł użytkownika z pliku JSON.
 * Korzysta z kontekstu haseł (`usePasswordContext`) oraz biblioteki `toast` do wyświetlania powiadomień.
 * @function ImportFromJSON
 * @returns {JSX.Element} Przycisk do importowania haseł z pliku JSON.
 * @example
 * ```tsx
 * import ImportFromJSON from './ImportFromJSON';
 * <ImportFromJSON />
 * ```
 * @see {@link "../data/PasswordContext"} - Kontekst haseł
 * @see {@link "https://www.npmjs.com/package/sonner"} - Biblioteka toast
 * @see {handleFileChange} - Funkcja obsługująca import
 */
export default function ImportFromJSON() {
  const { state, addPassword, updatePassword } = usePasswordContext();
  const [isImporting, setIsImporting] = useState(false);

  return (
    <label htmlFor="json-import" className="flex">
      <Button
        variant="outline"
        className="flex items-center gap-2 cursor-pointer select-none"
        disabled={isImporting || state.loading}
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
        onChange={(event) => handleFileChange(event, state, addPassword, updatePassword, setIsImporting)}
        disabled={isImporting || state.loading}
      />
    </label>
  );
}