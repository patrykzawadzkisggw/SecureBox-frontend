import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {  decryptPassword, PasswordTable } from "../data/PasswordContext";
import { toast } from "sonner";
import { RecoverMasterkeyDialog } from "./RecoverMasterkeyDialog";
import JSZip from "jszip";

/**
 * Komponent umożliwiający eksportowanie haseł użytkownika do pliku JSON.
 * Umożliwia odszyfrowanie haseł i zapisanie ich w formacie JSON, z obsługą dialogu odzyskiwania masterkey w razie potrzeby.
 *
 * @function ExportToJSON
 * @param {ExportToJSONProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Przycisk eksportu z opcjonalnym dialogiem odzyskiwania masterkey.
 *
 * @example
 * ```tsx
 * import ExportToJSON from '@/components/ExportToJSON';
 * import JSZip from 'jszip';
 *
 * const zip = new JSZip();
 * const passwords = [
 *   { id: '1', passwordfile: 'pass1.txt', platform: 'example', login: 'user', logo: '' }
 * ];
 * const setMasterkey = async (masterkey: string) => {
 *   console.log('Ustawiono masterkey:', masterkey);
 * };
 *
 * <ExportToJSON
 *   zip={zip}
 *   passwords={passwords}
 *   encryptionKey={cryptoKey}
 *   loading={false}
 *   setMasterkey={setMasterkey}
 * />
 * ```
 *
 * @remarks
 * - Komponent używa `Button` z biblioteki UI oraz ikony `Download` z `lucide-react`.
 * - Eksport wymaga:
 *   - Obiektu `zip` (JSZip) z zaszyfrowanymi plikami haseł.
 *   - Listy haseł (`passwords`) z metadanymi.
 *   - Klucza szyfrowania (`encryptionKey`) do odszyfrowania haseł.
 * - Jeśli `encryptionKey` jest niedostępny, otwiera się `RecoverMasterkeyDialog` do wprowadzenia masterkey.
 * - Walidacja obejmuje:
 *   - Sprawdzanie, czy `zip` i `passwords` nie są puste.
 *   - Sprawdzanie dostępności `encryptionKey`.
 * - Po pomyślnym eksporcie generowany jest plik JSON z danymi (platforma, login, odszyfrowane hasło).
 * - Błędy (np. brak danych, nieprawidłowy format hasła) są wyświetlane za pomocą powiadomień `toast`.
 * - Przycisk jest wyłączony podczas eksportu (`isExporting`), ładowania (`loading`) lub gdy brak haseł.
 * - Komponent korzysta z `useEffect` do automatycznego ponowienia eksportu po uzyskaniu klucza szyfrowania.
 * - Funkcja `decryptPassword` z `PasswordContext` jest używana do odszyfrowywania haseł.
 *
 * @see {@link decryptPassword,PasswordTable} - Funkcja `decryptPassword`.
 * @see {@link PasswordTable} - typ `PasswordTable`.
 * @see {@link RecoverMasterkeyDialog} - Dialog odzyskiwania masterkey.
 */
export default function ExportToJSON({zip, passwords, encryptionKey, loading, setMasterkey}: {zip: JSZip | null, passwords: PasswordTable[], encryptionKey?: CryptoKey, loading: boolean, setMasterkey: (masterkey: string) => Promise<void>}) {
  const [isExporting, setIsExporting] = useState(false);
  const [isRecoverDialogOpen, setIsRecoverDialogOpen] = useState(false);
  const [hasAttemptedExport, setHasAttemptedExport] = useState(false);

  const exportToJSON = async () => {
    setIsExporting(true);
    try {
      if (!zip || passwords.length === 0) {
        throw new Error("Brak danych do eksportu");
      }
      if (!encryptionKey) {
        if (!hasAttemptedExport) {
          setIsRecoverDialogOpen(true);
          setHasAttemptedExport(true);
        }
        throw new Error("Brak klucza szyfrowania");
      }

      const jsonData = [];
      for (const entry of passwords) {
        const encryptedData = await zip.file(entry.passwordfile)?.async("string");
        if (!encryptedData) {
          console.warn(`Nie znaleziono hasła dla ${entry.platform}/${entry.login}`);
          continue;
        }

        const [encrypted, iv] = encryptedData.split(":");
        if (!encrypted || !iv) {
          console.warn(`Nieprawidłowy format hasła dla ${entry.platform}/${entry.login}`);
          continue;
        }

        const decryptedPassword = await decryptPassword(encrypted, iv, encryptionKey);
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
    if (!isRecoverDialogOpen && encryptionKey && hasAttemptedExport) {
      exportToJSON();
    }
  }, [isRecoverDialogOpen, encryptionKey]);

  return (
    <>
      <Button
        variant="outline"
        className="flex items-center gap-2 select-none"
        onClick={exportToJSON}
        disabled={isExporting || loading || passwords.length === 0}
      >
        <Download className="w-4 h-4" />
        {isExporting ? "Eksportowanie..." : "Eksportuj do JSON"}
      </Button>
      <RecoverMasterkeyDialog
        isDialogOpen={isRecoverDialogOpen}
        setIsDialogOpen={setIsRecoverDialogOpen}
        setMasterkey={setMasterkey}
      />
    </>
  );
}