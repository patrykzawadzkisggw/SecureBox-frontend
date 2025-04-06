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
 */
interface DeleteAccountDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  platform: string;
  login: string;
}

/**
 * Komponent dialogu do usuwania konta.
 * Korzysta z kontekstu haseł (`usePasswordContext`) oraz biblioteki `toast` do wyświetlania powiadomień.
 */
export function DeleteAccountDialog({
  isDialogOpen,
  setIsDialogOpen,
  platform,
  login,
}: DeleteAccountDialogProps) {
  const { deletePassword } = usePasswordContext();
  const [isConfirming, setIsConfirming] = useState(false); 

  /**
   * Obsługuje usunięcie konta.
   * Wywołuje funkcję `deletePassword` z kontekstu.
   */
  const handleDelete = async () => {
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
            onClick={handleDelete}
            disabled={isConfirming}
          >
            {isConfirming ? "Usuwanie..." : "Usuń"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
