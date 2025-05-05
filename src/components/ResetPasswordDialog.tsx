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
  resetPasswordSubmit: (email: string, token: string) => Promise<void>;

  /**
   * Funkcja generująca token reCAPTCHA v3. Może być undefined w przypadku błędu ładowania skryptu.
   * @param action - Opcjonalna nazwa akcji dla reCAPTCHA.
   * @returns Obietnica zwracająca token reCAPTCHA.
   */
  executeRecaptcha: ((action?: string) => Promise<string>) | undefined;
}

/**
 * Komponent dialogu resetowania hasła dla aplikacji SecureBox.
 * Umożliwia użytkownikowi wprowadzenie adresu email w celu otrzymania linku do resetowania hasła.
 * Wykorzystuje walidację emaila, integrację z Google reCAPTCHA v3 oraz powiadomienia o stanie operacji.
 *
 * @function ResetPasswordDialog
 * @param {ResetPasswordDialogProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Dialog z polem email, przyciskami akcji i powiadomieniami.
 *
 * @example
 * ```tsx
 * import { ResetPasswordDialog } from "@/components/ResetPasswordDialog";
 * import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
 *
 * const MyComponent = () => {
 *   const { executeRecaptcha } = useGoogleReCaptcha();
 *   const resetPasswordSubmit = async (email: string, token: string) => {
 *     // Logika resetowania hasła
 *   };
 *   return (
 *     <ResetPasswordDialog
 *       isOpen={true}
 *       onClose={() => console.log("Zamknięto")}
 *       resetPasswordSubmit={resetPasswordSubmit}
 *       executeRecaptcha={executeRecaptcha}
 *     />
 *   );
 * };
 * ```
 *
 * @remarks
 * - **Funkcjonalność**:
 *   - Wyświetla pole do wprowadzenia adresu email i przyciski „Wyślij”/„Anuluj” przed wysłaniem linku.
 *   - Po udanym wysłaniu linku pokazuje potwierdzenie i przycisk „Zamknij”.
 *   - Po zamknięciu dialogu resetuje wszystkie stany lokalne (`email`, `emailError`, `isSent`).
 * - **Walidacja**:
 *   - Używa `validateEmail` z `@/lib/validators` do sprawdzenia formatu emaila.
 *   - Błąd walidacji wyświetla komunikat „Proszę wprowadzić poprawny adres email.” pod polem.
 * - **reCAPTCHA**:
 *   - Integruje Google reCAPTCHA v3 poprzez `executeRecaptcha`.
 *   - Token jest generowany asynchronicznie (`executeRecaptcha("submit_form")`) i przekazywany do `resetPasswordSubmit`.
 *   - W przypadku braku `executeRecaptcha` (np. błąd ładowania skryptu), proces jest przerywany.
 * - **Powiadomienia**:
 *   - Używa biblioteki `sonner` do wyświetlania powiadomieniami (`toast.success` lub `toast.error`).
 *   - Powiadomienia mają czas trwania 3000ms i zawierają opis sukcesu lub błędu.
 * - **Stany**:
 *   - `email`: Wartość wprowadzonego adresu email.
 *   - `emailError`: Komunikat błędu walidacji email.
 *   - `isLoading`: Stan ładowania podczas wysyłania żądania.
 *   - `isSent`: Potwierdzenie wysłania linku resetowania hasła.
 * - **Układ i stylizacja**:
 *   - Używa komponentów UI z `@/components/ui` (`Dialog`, `Input`, `Button`, `Label`).
 *   - Dialog jest responsywny, z maksymalną szerokością 425px (`sm:max-w-[425px]`).
 *   - Pole email jest w układzie grid z etykietą po lewej (`grid-cols-4`).
 *   - Komunikaty błędów są stylizowane z Tailwind CSS (`text-red-500`).
 * - **Dostępność**:
 *   - Etykieta jest powiązana z polem poprzez `htmlFor`.
 *   - Komunikat błędu jest wyświetlany w elemencie `<p>` z klasą `text-red-500` dla widoczności.
 *   - Przyciski mają czytelne etykiety („Wyślij”, „Anuluj”, „Zamknij”).
 *   - Rozważ dodanie `aria-describedby` dla pola email i `aria-live="polite"` dla komunikatów błędów.
 *   - Dialog powinien być testowany z czytnikami ekranu, aby zapewnić poprawną nawigację klawiaturą.
 * - **Bezpieczeństwo**:
 *   - reCAPTCHA v3 chroni przed botami, generując token weryfikacyjny.
 *   - Funkcja `resetPasswordSubmit` powinna być zabezpieczona po stronie serwera (np. walidacja tokena reCAPTCHA, ograniczenie liczby żądań na email).
 *   - Walidacja emaila po stronie klienta wymaga dodatkowej walidacji serwerowej.
 *   - Token resetowania hasła powinien mieć ograniczony czas ważności i być bezpiecznie generowany.
 * - **Zależności**:
 *   - Komponenty UI: `Dialog`, `DialogContent`, `DialogDescription`, `DialogFooter`, `DialogHeader`, `DialogTitle`, `Input`, `Label`, `Button` z `@/components/ui`.
 *   - Funkcje: `validateEmail` z `@/lib/validators`.
 *   - Biblioteki: `sonner` (`toast`), `react` (`useState`).
 * - **Testowanie**:
 *   - Komponent jest testowalny z `@testing-library/react`.
 *   - Mockuj: `resetPasswordSubmit`, `executeRecaptcha`, `validateEmail`.
 *   - Testuj:
 *     - Renderowanie dialogu w stanie otwartym/zamkniętym (`isOpen`).
 *     - Walidację emaila (poprawny/niepoprawny format).
 *     - Generowanie i przekazywanie tokenu reCAPTCHA.
 *     - Wyświetlanie powiadomień (`sonner`) dla sukcesu i błędów.
 *     - Zmianę stanów (`isSent`, `isLoading`, `emailError`).
 *     - Resetowanie stanów przy zamykaniu (`handleClose`).
 *     - Dostępność (atrybuty ARIA, fokus, czytniki ekranu).
 *   - Zobacz `tests/components/ResetPasswordDialog.test.tsx` (jeśli istnieje).
 * - **API**:
 *   - Komponent wywołuje `resetPasswordSubmit`, które prawdopodobnie komunikuje się z serwerem.
 *   - Token reCAPTCHA powinien być weryfikowany po stronie serwera.
 *   - Błędy (np. nieistniejący email) są obsługiwane w bloku `catch`.
 * - **Przekierowanie**:
 *   - Komponent nie wykonuje przekierowań, ale zamyka dialog po udanym wysłaniu linku.
 * - **Rozszerzalność**:
 *   - Możliwe dodanie dodatkowych pól (np. potwierdzenie emaila).
 *   - Dialog można rozszerzyć o instrukcje po wysłaniu linku (np. link do pomocy).
 *   - Powiadomienia `sonner` można dostosować (np. dodając akcje).
 *
 * @see {@link validateEmail} - Funkcja walidacji emaila.
 */
export function ResetPasswordDialog({ isOpen, onClose, resetPasswordSubmit,executeRecaptcha }: ResetPasswordDialogProps) {
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
      if(executeRecaptcha==undefined) return;
      const token = await executeRecaptcha("submit_form");
      console.log("r:", token.substring(0, 5));

      await resetPasswordSubmit(email,token);
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
