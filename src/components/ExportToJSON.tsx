import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { usePasswordContext, decryptPassword } from "../data/PasswordContext";
import { toast } from "sonner";
import { RecoverMasterkeyDialog } from "./RecoverMasterkeyDialog";

/**
 * Komponent ExportToJSON umożliwia eksportowanie haseł użytkownika do pliku JSON.
 * Korzysta z kontekstu haseł (`usePasswordContext`) oraz biblioteki `toast` do wyświetlania powiadomień.
 * @function ExportToJSON
 * @returns {JSX.Element} Przycisk eksportu z opcjonalnym dialogiem odzyskiwania klucza.
 * @example
 * ```tsx
 * import ExportToJSON from './ExportToJSON';
 * <ExportToJSON />
 * ```
 * @see {@link "../data/PasswordContext"} - Kontekst haseł i funkcja decryptPassword
 * @see {@link "https://www.npmjs.com/package/sonner"} - Biblioteka toast
 * @see {@link "./RecoverMasterkeyDialog"} - Dialog odzyskiwania klucza
 */
export default function ExportToJSON() {
  const { state } = usePasswordContext();
  const [isExporting, setIsExporting] = useState(false);
  const [isRecoverDialogOpen, setIsRecoverDialogOpen] = useState(false);
  const [hasAttemptedExport, setHasAttemptedExport] = useState(false);

  /**
   * Funkcja eksportująca hasła do pliku JSON.
   * Sprawdza dostępność danych i klucza szyfrowania, a następnie deszyfruje hasła i zapisuje je do pliku JSON.
   * @function exportToJSON
   * @returns {Promise<void>} Obietnica resolves po zakończeniu eksportu lub reject w przypadku błędu.
   */
  const exportToJSON = async () => {
    setIsExporting(true);
    try {
      if (!state.zip || state.passwords.length === 0) {
        throw new Error("Brak danych do eksportu");
      }
      if (!state.encryptionKey) {
        if (!hasAttemptedExport) {
          setIsRecoverDialogOpen(true);
          setHasAttemptedExport(true);
        }
        throw new Error("Brak klucza szyfrowania");
      }

      const jsonData = [];
      for (const entry of state.passwords) {
        const encryptedData = await state.zip.file(entry.passwordfile)?.async("string");
        if (!encryptedData) {
          console.warn(`Nie znaleziono hasła dla ${entry.platform}/${entry.login}`);
          continue;
        }

        const [encrypted, iv] = encryptedData.split(":");
        if (!encrypted || !iv) {
          console.warn(`Nieprawidłowy format hasła dla ${entry.platform}/${entry.login}`);
          continue;
        }

        const decryptedPassword = await decryptPassword(encrypted, iv, state.encryptionKey);
        jsonData.push({
          platform: entry.platform,
          login: entry.login,
          password: decryptedPassword.trim(),
        });
      }

      const jsonString = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `passwords_export_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Eksport zakończony!", {
        description: "Plik JSON z hasłami został pobrany.",
        duration: 3000,
      });
      setHasAttemptedExport(true);
    } catch (error) {
      console.error("Błąd podczas eksportu do JSON:", error);
      toast.error("Błąd!", {
        description: "Nie udało się wyeksportować haseł do JSON: " + (error instanceof Error ? error.message : "Nieznany błąd"),
        duration: 3000,
      });
      if (!hasAttemptedExport) {
        setIsRecoverDialogOpen(true);
        setHasAttemptedExport(true);
      }
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (!isRecoverDialogOpen && state.encryptionKey && hasAttemptedExport) {
      exportToJSON();
    }
  }, [isRecoverDialogOpen, state.encryptionKey]);

  return (
    <>
      <Button
        variant="outline"
        className="flex items-center gap-2 select-none"
        onClick={exportToJSON}
        disabled={isExporting || state.loading || state.passwords.length === 0}
      >
        <Download className="w-4 h-4" />
        {isExporting ? "Eksportowanie..." : "Eksportuj do JSON"}
      </Button>
      <RecoverMasterkeyDialog
        isDialogOpen={isRecoverDialogOpen}
        setIsDialogOpen={setIsRecoverDialogOpen}
      />
    </>
  );
}