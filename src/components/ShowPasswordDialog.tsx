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
import { usePasswordContext, decryptPassword } from "../data/PasswordContext";
import zxcvbn from "zxcvbn";
import { RecoverMasterkeyDialog } from "./RecoverMasterkeyDialog";

/**
 * Interfejs reprezentujący właściwości komponentu ShowPasswordDialog.
 */
interface ShowPasswordDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  passwordfile: string;
  platform: string;
  login: string;
}

/**
 * Komponent dialogu do wyświetlania hasła.
 * Korzysta z kontekstu haseł (`usePasswordContext`) oraz komponentu `RecoverMasterkeyDialog`.
 */
export function ShowPasswordDialog({
  isDialogOpen,
  setIsDialogOpen,
  passwordfile,
  platform,
  login,
}: ShowPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState(0);
  const [isRecoverDialogOpen, setIsRecoverDialogOpen] = useState(false);
  const [hasAttemptedDecryption, setHasAttemptedDecryption] = useState(false);
  const { state } = usePasswordContext();

  /**
   * Pobiera i deszyfruje hasło z pliku ZIP.
   * Sprawdza poprawność danych i wywołuje funkcję `decryptPassword` z kontekstu.
   */
  const fetchPassword = async () => {
    if (!state.zip || !isDialogOpen) return;

    try {
      const encryptedData = await state.zip.file(passwordfile)?.async("string");
      if (!encryptedData) throw new Error("Hasło nie znalezione w ZIP");

      const [encrypted, iv] = encryptedData.split(":");
      if (!encrypted || !iv) throw new Error("Nieprawidłowy format zaszyfrowanego hasła");

      if (!state.encryptionKey) {
        if (!hasAttemptedDecryption) {
          setIsRecoverDialogOpen(true);
          setHasAttemptedDecryption(true);
        }
        return;
      }

      const decryptedPassword = await decryptPassword(encrypted, iv, state.encryptionKey);
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
  }, [isDialogOpen, state.zip, state.encryptionKey, passwordfile]);


  useEffect(() => {
    if (!isRecoverDialogOpen && state.encryptionKey && hasAttemptedDecryption) {
      fetchPassword();
    }
  }, [isRecoverDialogOpen, state.encryptionKey]);

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
                <div className="w-full bg-gray-200 rounded-full h-2.5">
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
      />
    </>
  );
}
