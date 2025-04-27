import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {  PasswordTable, User } from "../data/PasswordContext";
import { toast } from "sonner";

/**
 * Interfejs reprezentujący właściwości komponentu UpdateMasterkeyDialog.
 *
 * @interface UpdateMasterkeyDialogProps
 * @property {boolean} isDialogOpen - Flaga wskazująca, czy dialog jest otwarty.
 * @property {React.Dispatch<React.SetStateAction<boolean>>} setIsDialogOpen - Funkcja do ustawiania stanu otwarcia dialogu.
 * @property {(oldMasterkey: string, newMasterkey: string, token: string | null, currentUser: User | null, passwords: PasswordTable[]) => Promise<void>} updatefn - Funkcja aktualizująca masterkey.
 * @property {string | null} token - Token autoryzacyjny użytkownika lub null, jeśli brak.
 * @property {User | null} currentUser - Obiekt bieżącego użytkownika lub null, jeśli brak danych.
 * @property {PasswordTable[]} passwords - Lista haseł użytkownika do aktualizacji.
 */
interface UpdateMasterkeyDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  updatefn: (oldMasterkey: string, newMasterkey: string, token: string | null, currentUser : User | null, passwords : PasswordTable[]) => Promise<void>;
  token: string | null;
  currentUser: User | null;
  passwords : PasswordTable[];
}

/**
 * Komponent dialogu do aktualizacji hasła szyfrowania (masterkey).
 * Umożliwia użytkownikowi wprowadzenie starego masterkey, nowego masterkey oraz potwierdzenie nowego masterkey.
 * Zawiera walidację danych wejściowych i integrację z powiadomieniami.
 *
 * @function UpdateMasterkeyDialog
 * @param {UpdateMasterkeyDialogProps} props - Właściwości komponentu.
 * @param {boolean} props.isDialogOpen - Flaga wskazująca, czy dialog jest otwarty.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setIsDialogOpen - Funkcja do ustawiania stanu otwarcia dialogu.
 * @param {(oldMasterkey: string, newMasterkey: string, token: string | null, currentUser: User | null, passwords: PasswordTable[]) => Promise<void>} props.updatefn - Funkcja aktualizująca masterkey.
 * @param {string | null} props.token - Token autoryzacyjny użytkownika lub null.
 * @param {User | null} props.currentUser - Obiekt bieżącego użytkownika lub null, jeśli brak danych.
 * @param {PasswordTable[]} props.passwords - Lista haseł użytkownika do aktualizacji.
 * @returns {JSX.Element} Dialog z formularzem do aktualizacji masterkey.
 *
 * @example
 * ```tsx
 * import { UpdateMasterkeyDialog } from '@/components/UpdateMasterkeyDialog';
 *
 * const updateMasterkey = async (oldMasterkey, newMasterkey, token, currentUser, passwords) => {
 *   console.log('Zaktualizowano masterkey:', { oldMasterkey, newMasterkey });
 * };
 * const currentUser = { id: '1', login: 'user@example.com', first_name: 'Jan', last_name: 'Kowalski', password: 'pass' };
 * const passwords = [{ id: '1', passwordfile: 'encrypted', logo: '', platform: 'example', login: 'user' }];
 *
 * <UpdateMasterkeyDialog
 *   isDialogOpen={true}
 *   setIsDialogOpen={setIsOpen}
 *   updatefn={updateMasterkey}
 *   token="abc123"
 *   currentUser={currentUser}
 *   passwords={passwords}
 * />
 * ```
 *
 * @remarks
 * - Komponent używa `Dialog`, `Input`, `Button` i `Label` z biblioteki UI do renderowania formularza w oknie dialogowym.
 * - Walidacja obejmuje:
 *   - Wszystkie pola (stare masterkey, nowe masterkey, potwierdzenie) muszą być wypełnione.
 *   - Nowe masterkey i jego potwierdzenie muszą być identyczne.
 * - Błędy walidacji lub aktualizacji są wyświetlane w centrum dialogu z czerwonym tekstem.
 * - Funkcja `updatefn` jest wywoływana tylko po pomyślnej walidacji.
 * - Powiadomienia (`toast`) informują o sukcesie lub błędach podczas aktualizacji.
 * - Po pomyślnej aktualizacji dialog jest zamykany, a pola formularza są resetowane.
 * - Przycisk „Anuluj” zamyka dialog bez zapisywania zmian.
 *
 * @see {@link User,PasswordTable} - Definicja typu `User`.
 * @see {@link PasswordTable} - Definicja typu  `PasswordTable`.
 */
export function UpdateMasterkeyDialog({
  isDialogOpen,
  setIsDialogOpen,
  updatefn, token, currentUser, passwords
}: UpdateMasterkeyDialogProps) {
  const [oldMasterkey, setOldMasterkey] = useState("");
  const [newMasterkey, setNewMasterkey] = useState("");
  const [confirmNewMasterkey, setConfirmNewMasterkey] = useState("");
  const [error, setError] = useState("");


  const handleSubmit = async () => {
    setError("");

    if (!oldMasterkey || !newMasterkey || !confirmNewMasterkey) {
      setError("Wszystkie pola są wymagane.");
      return;
    }
    if (newMasterkey !== confirmNewMasterkey) {
      setError("Nowe hasło masterkey i jego potwierdzenie muszą być identyczne.");
      return;
    }

    try {
      await updatefn(oldMasterkey, newMasterkey, token, currentUser, passwords);
      toast.success("Masterkey zaktualizowany pomyślnie!", { duration: 3000 });
      setIsDialogOpen(false);
      setOldMasterkey("");
      setNewMasterkey("");
      setConfirmNewMasterkey("");
    } catch (error) {
      console.error("Błąd aktualizacji masterkey:", error);
      setError("Nie udało się zaktualizować masterkey. Sprawdź dane i spróbuj ponownie.");
      toast.error("Błąd aktualizacji masterkey!", {
        description: (error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd."),
        duration: 3000,
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Zmień Masterkey</DialogTitle>
          <DialogDescription>Aktualizuj swoje hasło szyfrowania (masterkey).</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="oldMasterkey" className="text-right">Stare Masterkey</Label>
            <Input
              id="oldMasterkey"
              type="password"
              value={oldMasterkey}
              onChange={(e) => setOldMasterkey(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="newMasterkey" className="text-right">Nowe Masterkey</Label>
            <Input
              id="newMasterkey"
              type="password"
              value={newMasterkey}
              onChange={(e) => setNewMasterkey(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confirmNewMasterkey" className="text-right">Potwierdź nowe Masterkey</Label>
            <Input
              id="confirmNewMasterkey"
              type="password"
              value={confirmNewMasterkey}
              onChange={(e) => setConfirmNewMasterkey(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
          {error && <p className="text-red-500 text-sm col-span-4 text-center">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Anuluj</Button>
          <Button onClick={handleSubmit}>Zapisz</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
