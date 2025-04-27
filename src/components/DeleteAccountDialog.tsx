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
import { toast } from "sonner";

/**
 * Interfejs reprezentujący właściwości komponentu DeleteAccountDialog.
 * @interface DeleteAccountDialogProps
 * @property {boolean} isDialogOpen - Stan określający, czy dialog jest otwarty.
 * @property {React.Dispatch<React.SetStateAction<boolean>>} setIsDialogOpen - Funkcja ustawiająca stan otwarcia dialogu.
 * @property {string} platform - Nazwa platformy, której dotyczy konto.
 * @property {string} login - Login użytkownika dla danej platformy.
 * @property {(platform: string, login: string) => Promise<void>} deletePassword - Funkcja do usuwania hasła.
 */
export interface DeleteAccountDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  platform: string;
  login: string;
  deletePassword: (platform: string, login: string) => Promise<void>;
}

/**
 * Funkcja obsługująca proces usuwania konta.
 * Wywołuje funkcję `deletePassword`, wyświetla powiadomienia o wyniku operacji i zarządza stanem dialogu.
 *
 * @function handleDelete
 * @param {string} platform - Nazwa platformy.
 * @param {string} login - Login użytkownika.
 * @param {(platform: string, login: string) => Promise<void>} deletePassword - Funkcja usuwająca hasło.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setIsConfirming - Funkcja ustawiająca stan potwierdzenia usuwania.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setIsDialogOpen - Funkcja zamykająca dialog.
 * @returns {Promise<void>} Obietnica 
 *
 * @remarks
 * - Ustawia stan `isConfirming` na `true` podczas usuwania, aby dezaktywować przyciski.
 * - W przypadku sukcesu wyświetla powiadomienie `toast.success` i zamyka dialog.
 * - W przypadku błędu wyświetla powiadomienie `toast.error` i loguje błąd do konsoli.
 * - Zawsze resetuje stan `isConfirming` na `false` po zakończeniu operacji.
 *
 * @see {toast} - Biblioteka powiadomień (`toast`).
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
 * Komponent dialogu do potwierdzania usunięcia konta użytkownika dla określonej platformy i loginu.
 * Wyświetla ostrzeżenie o nieodwracalności akcji i umożliwia usunięcie konta za pomocą funkcji `deletePassword`.
 * Wykorzystuje bibliotekę `sonner` do wyświetlania powiadomień o wyniku operacji.
 *
 * @function DeleteAccountDialog
 * @param {DeleteAccountDialogProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Dialog potwierdzający usunięcie konta.
 *
 * @example
 * ```tsx
 * import { DeleteAccountDialog } from '@/components/DeleteAccountDialog';
 *
 * const [isOpen, setIsOpen] = React.useState(false);
 * const deletePassword = async (platform: string, login: string) => {
 *   console.log(`Usunięto konto dla ${platform}/${login}`);
 * };
 *
 * <DeleteAccountDialog
 *   isDialogOpen={isOpen}
 *   setIsDialogOpen={setIsOpen}
 *   platform="Twitter"
 *   login="user123"
 *   deletePassword={deletePassword}
 * />
 * ```
 *
 * @remarks
 * - Komponent używa `Button` z wariantami `outline` (anulowanie) i `destructive` (usuwanie) z biblioteki UI.
 * - Funkcja `deletePassword` jest wywoływana asynchronicznie i musi być dostarczona jako prop.
 * - Powiadomienia są wyświetlane za pomocą `toast` z biblioteki `sonner`:
 *   - Sukces: "Konto zostało usunięte."
 *   - Błąd: "Nie udało się usunąć konta. Spróbuj ponownie."
 * - Przyciski są dezaktywowane podczas operacji usuwania (`isConfirming`).
 * - Dialog zamyka się automatycznie po pomyślnym usunięciu konta lub po anulowaniu.
 * - Funkcja `handleDelete` obsługuje logikę usuwania i powiadomienia.
 *
 * @see {@link handleDelete} - Funkcja obsługująca usunięcie konta.
 */
export function DeleteAccountDialog({
  isDialogOpen,
  setIsDialogOpen,
  platform,
  login,
  deletePassword,
}: DeleteAccountDialogProps) {
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