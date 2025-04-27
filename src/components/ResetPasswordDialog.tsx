import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { validateEmail } from "@/lib/validators";


/**
 * Interfejs reprezentujący właściwości komponentu ResetPasswordDialog.
 */
interface ResetPasswordDialogProps {
  /**
   * Określa, czy dialog jest otwarty.
   * @type {boolean}
   */
  isOpen: boolean;

  /**
   * Funkcja wywoływana przy zamykaniu dialogu.
   * Resetuje stan komponentu i zamyka modal.
   * @type {() => void}
   */
  onClose: () => void;

  /**
   * Asynchroniczna funkcja wysyłająca żądanie resetowania hasła dla podanego adresu email.
   * @param {string} email - Adres email użytkownika.
   * @returns {Promise<void>} Obietnica oznaczająca zakończenie operacji.
   */
  resetPasswordSubmit: (email: string) => Promise<void>;
}

/**
 * Komponent dialogu do resetowania hasła.
 * Umożliwia użytkownikowi wprowadzenie adresu email, walidację tego adresu oraz wysłanie linku do resetowania hasła.
 * Wykorzystuje bibliotekę `sonner` do wyświetlania powiadomień o sukcesie lub błędzie.
 *
 * @param {ResetPasswordDialogProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Dialog z polem do wprowadzenia adresu email oraz przyciskami akcji.
 *
 * @example
 * ```tsx
 * import { ResetPasswordDialog } from '@/components/ResetPasswordDialog';
 *
 * const resetPasswordSubmit = async (email: string) => {
 *   console.log('Wysłano link resetowania dla:', email);
 * };
 *
 * <ResetPasswordDialog
 *   isOpen={true}
 *   onClose={() => console.log('Zamknięto dialog')}
 *   resetPasswordSubmit={resetPasswordSubmit}
 * />
 * ```
 *
 * @remarks
 * - Komponent korzysta z funkcji `validateEmail` z `@/lib/validators` do walidacji adresu email.
 * - Wyświetla dynamiczne komunikaty w zależności od stanu:
 *   - Przed wysłaniem: prośba o podanie adresu email.
 *   - Po wysłaniu: potwierdzenie wysłania linku.
 * - Obsługuje stany:
 *   - `email`: Wartość wprowadzonego adresu email.
 *   - `emailError`: Komunikat błędu walidacji email.
 *   - `isLoading`: Stan ładowania podczas wysyłania żądania.
 *   - `isSent`: Potwierdzenie wysłania linku.
 * - Powiadomienia (`toast`) są wyświetlane za pomocą biblioteki `sonner` z czasem trwania 3 sekundy.
 * - Walidacja email:
 *   - Jeśli `validateEmail` zwraca błąd, wyświetla komunikat `"Proszę wprowadzić poprawny adres email."`.
 * - W przypadku błędu wysyłania linku (np. problem z serwerem), wyświetla powiadomienie o niepowodzeniu.
 * - Funkcja `resetPasswordSubmit` jest wywoływana asynchronicznie i oczekuje adresu email jako argumentu.
 * - Przy zamykaniu dialogu resetowane są wszystkie stany lokalne (`email`, `emailError`, `isSent`).
 * - Komponent używa komponentów UI z `@/components/ui` (np. `Dialog`, `Input`, `Button`) do renderowania interfejsu.
 *
 * @see {@link validateEmail} - Funkcja walidacji email (`validateEmail`).
 */
export function ResetPasswordDialog({ isOpen, onClose, resetPasswordSubmit }: ResetPasswordDialogProps) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);


 

  
  const handleSubmit = async () => {
    const valRes = validateEmail(email);
    if (valRes) {
      setEmailError("Proszę wprowadzić poprawny adres email.");
      return;
    }

    setEmailError("");
    setIsLoading(true);

    try {
      

      await resetPasswordSubmit(email);
      setIsSent(true);
      toast.success("Link do resetowania hasła został wysłany!", {
        description: `Sprawdź swoją skrzynkę: ${email}`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Błąd wysyłania linku:", error);
      toast.error("Błąd!", {
        description: "Nie udało się wysłać linku do resetowania hasła.",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleClose = () => {
    setEmail("");
    setEmailError("");
    setIsSent(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resetowanie hasła</DialogTitle>
          <DialogDescription>
            {isSent
              ? "Link do resetowania hasła został wysłany na podany adres email."
              : "Podaj adres email, na który wyślemy link do resetowania hasła."}
          </DialogDescription>
        </DialogHeader>
        {!isSent ? (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.pl"
                className="col-span-3"
                disabled={isLoading}
              />
            </div>
            {emailError && (
              <p className="text-red-500 text-sm text-center">{emailError}</p>
            )}
          </div>
        ) : null}
        <DialogFooter>
          {!isSent ? (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Anuluj
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Wysyłanie..." : "Wyślij"}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>Zamknij</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
