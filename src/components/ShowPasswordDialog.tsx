import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {  decryptPassword } from "../data/PasswordContext";
import zxcvbn from "zxcvbn";
import { RecoverMasterkeyDialog } from "./RecoverMasterkeyDialog";
import JSZip from "jszip";

/**
 * Interfejs reprezentujący właściwości komponentu ShowPasswordDialog.
 */
export interface ShowPasswordDialogProps {
  /** Czy dialog jest otwarty. */
  isDialogOpen: boolean;
  /** Funkcja ustawiająca stan otwarcia dialogu. */
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  /** Nazwa pliku hasła w archiwum ZIP. */
  passwordfile: string;
  /** Nazwa platformy powiązana z hasłem. */
  platform: string;
  /** Login powiązany z hasłem. */
  login: string;
  /** Obiekt JSZip zawierający zaszyfrowane pliki haseł. */
  zip: JSZip | null;
  /** Klucz szyfrowania do odszyfrowania hasła (opcjonalny). */
  encryptionKey?: CryptoKey;
  /** Funkcja ustawiająca klucz główny po jego odzyskaniu. */
  setMasterkey: (masterkey: string) => Promise<void>;
}

/**
 * Komponent dialogu do wyświetlania odszyfrowanego hasła dla wybranej platformy i loginu.
 * Umożliwia podgląd hasła, ocenę jego siły za pomocą biblioteki `zxcvbn` oraz obsługę odzyskiwania klucza głównego w przypadku braku klucza szyfrowania.
 *
 * @param {ShowPasswordDialogProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Dialog z informacjami o haśle i opcjonalnym dialogiem odzyskiwania klucza głównego.
 *
 * @example
 * ```tsx
 * import { ShowPasswordDialog } from '@/components/ShowPasswordDialog';
 * import JSZip from 'jszip';
 *
 * const zip = new JSZip();
 * const setMasterkey = async (masterkey: string) => {
 *   console.log('Ustawiono klucz główny:', masterkey);
 * };
 *
 * <ShowPasswordDialog
 *   isDialogOpen={true}
 *   setIsDialogOpen={setIsOpen}
 *   passwordfile="pass1.txt"
 *   platform="example"
 *   login="user"
 *   zip={zip}
 *   encryptionKey={cryptoKey}
 *   setMasterkey={setMasterkey}
 * />
 * ```
 *
 * @remarks
 * - Komponent korzysta z biblioteki `zxcvbn` do oceny siły hasła, gdzie wynik jest normalizowany do skali 0-100%.
 * - Wymaga:
 *   - Obiektu `zip` (JSZip) z zaszyfrowanymi plikami haseł.
 *   - Nazwy pliku hasła (`passwordfile`) w archiwum ZIP.
 *   - Klucza szyfrowania (`encryptionKey`) do odszyfrowania hasła.
 * - Jeśli `encryptionKey` jest niedostępny, otwiera się `RecoverMasterkeyDialog` do wprowadzenia klucza głównego.
 * - Walidacja obejmuje:
 *   - Sprawdzanie dostępności `zip` i `passwordfile`.
 *   - Weryfikację formatu zaszyfrowanych danych (oczekiwany format: `encrypted:iv`).
 * - W przypadku błędów (np. brak pliku, nieprawidłowy format, błąd deszyfrowania) wyświetlane jest "Błąd deszyfrowania".
 * - Siła hasła jest wyświetlana jako pasek postępu i wartość procentowa.
 * - Komponent używa `useEffect` do:
 *   - Pobierania i deszyfrowania hasła przy otwarciu dialogu.
 *   - Automatycznego ponowienia deszyfrowania po uzyskaniu klucza szyfrowania z dialogu odzyskiwania.
 * - Funkcja `decryptPassword` z `PasswordContext` jest używana do odszyfrowywania haseł.
 *
 * @see {@link decryptPassword} - Funkcja `decryptPassword`.
 * @see {@link RecoverMasterkeyDialog} - Dialog odzyskiwania klucza głównego.
 */
export function ShowPasswordDialog({
  isDialogOpen,
  setIsDialogOpen,
  passwordfile,
  platform,
  login,
  zip,
  encryptionKey,
  setMasterkey
}: ShowPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState(0);
  const [isRecoverDialogOpen, setIsRecoverDialogOpen] = useState(false);
  const [hasAttemptedDecryption, setHasAttemptedDecryption] = useState(false);

 
  const fetchPassword = async () => {
    if (!zip || !isDialogOpen) return;

    try {
      

      const encryptedData = await zip.file(passwordfile)?.async("string");
      if (!encryptedData) throw new Error("Hasło nie znalezione w ZIP");

      const [encrypted, iv] = encryptedData.split(":");
      if (!encrypted || !iv) throw new Error("Nieprawidłowy format zaszyfrowanego hasła");

      if (!encryptionKey) {
        if (!hasAttemptedDecryption) {
          setIsRecoverDialogOpen(true);
          setHasAttemptedDecryption(true);
        }
        return;
      }

      const decryptedPassword = await decryptPassword(encrypted, iv, encryptionKey);
      setPassword(decryptedPassword);
      setStrength((zxcvbn(decryptedPassword).score / 4) * 100);
      setHasAttemptedDecryption(true); 
    } catch (error) {
      console.error("Błąd odczytu/deszyfrowania hasła:", error);
      setPassword("Błąd deszyfrowania");
      setStrength(0);
      if (!hasAttemptedDecryption) {
        setIsRecoverDialogOpen(true); 
        setHasAttemptedDecryption(true);
      }
    }
  };

  useEffect(() => {
    if (isDialogOpen) {
      fetchPassword();
    }
  }, [isDialogOpen, zip, encryptionKey, passwordfile]);


  useEffect(() => {
    if (!isRecoverDialogOpen && encryptionKey && hasAttemptedDecryption) {
      fetchPassword();
    }
  }, [isRecoverDialogOpen, encryptionKey]);

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Pokaż hasło</DialogTitle>
            <DialogDescription>Podgląd hasła dla {platform}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Login</Label>
              <div className="col-span-3 text-gray-800">{login}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Hasło</Label>
              <div className="col-span-3 text-gray-800">{password || "Ładowanie..."}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Siła hasła</Label>
              <div className="col-span-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5" role="progressbar" aria-valuenow={strength} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${strength}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">{strength.toFixed(0)}%</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>Zamknij</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <RecoverMasterkeyDialog
        isDialogOpen={isRecoverDialogOpen}
        setIsDialogOpen={setIsRecoverDialogOpen}
        setMasterkey={setMasterkey}
      />
    </>
  );
}
