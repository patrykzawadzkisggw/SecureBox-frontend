import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { usePasswordContext } from "../data/PasswordContext";
import { toast } from "sonner";

/**
 * Komponent ImportFromJSON umożliwia importowanie haseł użytkownika z pliku JSON.
 * Korzysta z kontekstu haseł (`usePasswordContext`) oraz biblioteki `toast` do wyświetlania powiadomień.
 */
export default function ImportFromJSON() {
  const { state, addPassword, updatePassword } = usePasswordContext();
  const [isImporting, setIsImporting] = useState(false);

  /**
   * Obsługuje zmianę pliku JSON.
   * Sprawdza poprawność danych i wywołuje funkcje `addPassword` oraz `updatePassword` z kontekstu.
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
        onChange={handleFileChange}
        disabled={isImporting || state.loading}
      />
    </label>
  );
}
