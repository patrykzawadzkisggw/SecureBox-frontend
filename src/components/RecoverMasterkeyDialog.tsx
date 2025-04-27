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
import { toast } from "sonner";

/**
 * Interfejs reprezentujący właściwości komponentu RecoverMasterkeyDialog.
 *
 * @property {boolean} isDialogOpen - Flaga wskazująca, czy dialog jest otwarty.
 * @property {React.Dispatch<React.SetStateAction<boolean>>} setIsDialogOpen - Funkcja do ustawiania stanu otwarcia dialogu.
 * @property {(masterkey: string) => Promise<void>} setMasterkey - Funkcja weryfikująca i ustawiająca masterkey.
 */
interface RecoverMasterkeyDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setMasterkey: (masterkey: string) => Promise<void>;
}

/**
 * Komponent dialogu do odzyskiwania hasła szyfrowania (masterkey).
 * Umożliwia użytkownikowi wprowadzenie masterkey oraz jego potwierdzenie w celu odzyskania dostępu do zaszyfrowanych haseł.
 * Zawiera walidację danych wejściowych i integrację z powiadomieniami.
 *
 * @function RecoverMasterkeyDialog
 * @param {RecoverMasterkeyDialogProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Dialog z formularzem do weryfikacji masterkey.
 *
 * @example
 * ```tsx
 * import { RecoverMasterkeyDialog } from '@/components/RecoverMasterkeyDialog';
 *
 * const setMasterkey = async (masterkey: string) => {
 *   console.log('Zweryfikowano masterkey:', masterkey);
 * };
 *
 * <RecoverMasterkeyDialog
 *   isDialogOpen={true}
 *   setIsDialogOpen={setIsOpen}
 *   setMasterkey={setMasterkey}
 * />
 * ```
 *
 * @remarks
 * - Komponent używa `Dialog`, `Input`, `Button` i `Label` z biblioteki UI do renderowania formularza w oknie dialogowym.
 * - Walidacja obejmuje:
 *   - Oba pola (masterkey i potwierdzenie) muszą być wypełnione.
 *   - Masterkey i jego potwierdzenie muszą być identyczne.
 * - Błędy walidacji lub weryfikacji są wyświetlane w centrum dialogu z czerwonym tekstem.
 * - Funkcja `setMasterkey` jest wywoływana tylko po pomyślnej walidacji.
 * - Powiadomienia (`toast`) informują o sukcesie lub błędach podczas weryfikacji.
 * - Po pomyślnej weryfikacji dialog jest zamykany, a pola formularza są resetowane.
 * - Przycisk „Anuluj” zamyka dialog bez weryfikacji.
 * - Komponent operuje na dostarczonej funkcji `setMasterkey`.
 *
 */
export function RecoverMasterkeyDialog({
  isDialogOpen,
  setIsDialogOpen,
  setMasterkey
}: RecoverMasterkeyDialogProps) {
  const [masterkey, setMasterkey2] = useState("");
  const [confirmMasterkey, setConfirmMasterkey] = useState("");
  const [error, setError] = useState("");

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
