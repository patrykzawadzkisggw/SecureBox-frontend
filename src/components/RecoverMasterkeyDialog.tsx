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
import { usePasswordContext } from "../data/PasswordContext";
import { toast } from "sonner";

/**
 * Interfejs reprezentujący właściwości komponentu RecoverMasterkeyDialog.
 */
interface RecoverMasterkeyDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Komponent dialogu do odzyskiwania masterkey.
 * Korzysta z kontekstu haseł (`usePasswordContext`) oraz biblioteki `toast` do wyświetlania powiadomień.
 */
export function RecoverMasterkeyDialog({
  isDialogOpen,
  setIsDialogOpen,
}: RecoverMasterkeyDialogProps) {
  const [masterkey, setMasterkey2] = useState("");
  const [confirmMasterkey, setConfirmMasterkey] = useState("");
  const [error, setError] = useState("");
  const { setMasterkey } = usePasswordContext();

  /**
   * Obsługuje przesłanie formularza odzyskiwania masterkey.
   * Sprawdza poprawność danych i wywołuje funkcję `setMasterkey` z kontekstu.
   */
  const handleSubmit = async () => {
    setError("");

    if (!masterkey || !confirmMasterkey) {
      setError("Oba pola są wymagane.");
      return;
    }
    if (masterkey !== confirmMasterkey) {
      setError("Masterkey i jego potwierdzenie muszą być identyczne.");
      return;
    }

    try {
      await setMasterkey(masterkey);

      toast.info("Masterkey ustawiony!", {
        description: "Masterkey ustawiony.",
        duration: 3000,
      });

      setIsDialogOpen(false);
      setMasterkey2("");
      setConfirmMasterkey("");
    } catch (error) {
      console.error("Błąd podczas weryfikacji masterkey:", error);
      setError("Podany masterkey jest nieprawidłowy lub nie można odszyfrować haseł.");
      toast.error("Błąd!", {
        description: "Nie udało się zweryfikować masterkey. Spróbuj ponownie.",
        duration: 3000,
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Wprowadź Masterkey</DialogTitle>
          <DialogDescription>
            Wpisz swoje hasło szyfrowania (masterkey), aby odzyskać dostęp do zaszyfrowanych haseł.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="masterkey" className="text-right">
              Masterkey
            </Label>
            <Input
              id="masterkey"
              type="password"
              value={masterkey}
              onChange={(e) => setMasterkey2(e.target.value)}
              className="col-span-3"
              placeholder="Wpisz masterkey"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confirmMasterkey" className="text-right">
              Potwierdź Masterkey
            </Label>
            <Input
              id="confirmMasterkey"
              type="password"
              value={confirmMasterkey}
              onChange={(e) => setConfirmMasterkey(e.target.value)}
              className="col-span-3"
              placeholder="Potwierdź masterkey"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            {error && <p className="text-red-500 text-sm col-span-4 text-center">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Anuluj
          </Button>
          <Button onClick={handleSubmit}>Zweryfikuj</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
