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
import { usePasswordContext } from "../data/PasswordContext";
import { toast } from "sonner";

/**
 * Interfejs reprezentujący właściwości komponentu DeleteAccountDialog.
 * @interface DeleteAccountDialogProps
 * @property {boolean} isDialogOpen - Stan określający, czy dialog jest otwarty.
 * @property {React.Dispatch<React.SetStateAction<boolean>>} setIsDialogOpen - Funkcja ustawiająca stan otwarcia dialogu.
 * @property {string} platform - Nazwa platformy, której dotyczy konto.
 * @property {string} login - Login użytkownika dla danej platformy.
 */
interface DeleteAccountDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  platform: string;
  login: string;
}

/**
 * Obsługuje usunięcie konta.
 * Wywołuje funkcję `deletePassword` z kontekstu i wyświetla powiadomienia o wyniku operacji.
 * @function handleDelete
 * @param {string} platform - Nazwa platformy.
 * @param {string} login - Login użytkownika.
 * @param {Function} deletePassword - Funkcja z kontekstu do usuwania hasła.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setIsConfirming - Funkcja ustawiająca stan potwierdzenia.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setIsDialogOpen - Funkcja zamykająca dialog.
 * @returns {Promise<void>} Obietnica resolves po usunięciu konta lub reject w przypadku błędu.
 */
export const handleDelete = async (
  platform: string,
  login: string,
  deletePassword: (platform: string, login: string) => Promise<void>,
  setIsConfirming: React.Dispatch<React.SetStateAction<boolean>>,
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> => {
  setIsConfirming(true);
  try {
    await deletePassword(platform, login);
    toast.success("Konto zostało usunięte.", { duration: 3000 });
    setIsDialogOpen(false);
  } catch (error) {
    console.error("Błąd podczas usuwania konta:", error);
    toast.error("Błąd!", {
      description: "Nie udało się usunąć konta. Spróbuj ponownie.",
      duration: 3000,
    });
  } finally {
    setIsConfirming(false);
  }
};

/**
 * Komponent dialogu do usuwania konta.
 * Korzysta z kontekstu haseł (`usePasswordContext`) oraz biblioteki `toast` do wyświetlania powiadomień.
 * @function DeleteAccountDialog
 * @param {DeleteAccountDialogProps} props - Właściwości komponentu.
 * @param {boolean} props.isDialogOpen - Stan otwarcia dialogu.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setIsDialogOpen - Funkcja do zmiany stanu dialogu.
 * @param {string} props.platform - Nazwa platformy.
 * @param {string} props.login - Login użytkownika.
 * @returns {JSX.Element} Dialog potwierdzający usunięcie konta.
 * @example
 * ```tsx
 * import { DeleteAccountDialog } from './DeleteAccountDialog';
 * const [isOpen, setIsOpen] = useState(false);
 * <DeleteAccountDialog isDialogOpen={isOpen} setIsDialogOpen={setIsOpen} platform="Twitter" login="user123" />
 * ```
 * @see {@link "../data/PasswordContext"} - Kontekst haseł
 * @see {@link "https://www.npmjs.com/package/sonner"} - Biblioteka toast
 * @see {handleDelete} - Funkcja obsługująca usunięcie konta
 */
export function DeleteAccountDialog({
  isDialogOpen,
  setIsDialogOpen,
  platform,
  login,
}: DeleteAccountDialogProps) {
  const { deletePassword } = usePasswordContext();
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Usuń konto</DialogTitle>
          <DialogDescription>
            Czy na pewno chcesz usunąć hasło dla {platform} ({login})? Tej akcji nie można cofnąć.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isConfirming}>
            Anuluj
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDelete(platform, login, deletePassword, setIsConfirming, setIsDialogOpen)}
            disabled={isConfirming}
          >
            {isConfirming ? "Usuwanie..." : "Usuń"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}