import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { encryptMasterkey } from "../data/PasswordContext";
import { ResetPasswordDialog } from "./ResetPasswordDialog";
import { Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { getFailedLogins, getRemainingLockoutTime, isEmailLockedOut, recordFailedAttempt, saveFailedLogins } from "@/lib/functions";
import { validateEmail, validatePassword } from "@/lib/validators";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

/**
 * Interfejs definiujący właściwości komponentu `LoginForm`.
 * Określa propsy wymagane do obsługi logowania, resetowania hasła oraz walidacji danych wejściowych.
 *
 *
 * @example
 * ```tsx
 * import { LoginForm } from '@/components/LoginForm';
 *
 * const loginUser = async (login: string, password: string, masterkey: string) => {
 *   console.log('Logowanie:', login, password, masterkey);
 * };
 * const resetPasswordSubmit = async (email: string) => {
 *   console.log('Wysłano link resetowania dla:', email);
 * };
 *
 * <LoginForm
 *   loginUser={loginUser}
 *   resetPasswordSubmit={resetPasswordSubmit}
 *   className="my-custom-class"
 * />
 * ```
 *
 * @remarks
 * - Interfejs rozszerza standardowe właściwości formularza HTML (`React.ComponentProps<"form">`).
 * - Właściwość `loginUser` jest funkcją asynchroniczną odpowiedzialną za logowanie użytkownika.
 * - Właściwość `resetPasswordSubmit` jest funkcją asynchroniczną wysyłającą żądanie resetowania hasła.
 * - Właściwość `className` pozwala na dodanie niestandardowych klas CSS do formularza.
 * - Wszystkie właściwości są wymagane, z wyjątkiem `className` i innych opcjonalnych propsów formularza.
 *
 * @see {@link LoginForm} - Komponent korzystający z tego interfejsu.
 */
interface LoginFormProps extends React.ComponentProps<"form"> {

  /**
   * Asynchroniczna funkcja obsługująca logowanie użytkownika.
   * @param {string} login - Adres email lub login użytkownika.
   * @param {string} password - Hasło logowania.
   * @param {string} masterkey - Klucz główny (hasło szyfrowania).
   * @returns {Promise<void>} Obietnica oznaczająca zakończenie operacji logowania.
   */
  loginUser: (login: string, password: string, masterkey: string, token2: string) => Promise<void>;

  /**
   * Asynchroniczna funkcja wysyłająca żądanie resetowania hasła dla podanego adresu email.
   * @param {string} email - Adres email użytkownika.
   * @returns {Promise<void>} Obietnica oznaczająca zakończenie operacji.
   */
  resetPasswordSubmit: (email: string,token: string) => Promise<void>;
}


/**
 * Komponent formularza logowania.
 * Umożliwia logowanie użytkownika, walidację danych wejściowych oraz resetowanie hasła.
 * Liczy nieudane próby logowania dla danego emaila i blokuje możliwość logowania po 5 nieudanych próbach na 10 minut.
 *
 * @function LoginForm
 * @param {LoginFormProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Formularz logowania z polami i opcjami resetowania hasła.
 *
 * @example
 * ```tsx
 * import { LoginForm } from '@/components/LoginForm';
 *
 * const loginUser = async (login: string, password: string, masterkey: string) => {
 *   console.log('Logowanie:', login, password, masterkey);
 * };
 * const resetPasswordSubmit = async (email: string) => {
 *   console.log('Wysłano link resetowania dla:', email);
 * };
 *
 * <LoginForm
 *   loginUser={loginUser}
 *   resetPasswordSubmit={resetPasswordSubmit}
 *   className="my-custom-class"
 * />
 * ```
 *
 * @remarks
 * - **Walidacja danych**:
 *   - Pole `login` jest walidowane za pomocą `validateEmail` z `@/lib/validators`.
 *   - Pole `password` jest walidowane za pomocą `validatePassword` z `@/lib/validators`.
 *   - Pola `masterkey` i `masterkey2` muszą być identyczne.
 * - **Blokada logowania**:
 *   - Po 5 nieudanych próbach logowania dla danego emaila, logowanie jest blokowane na 10 minut.
 *   - Nieudane próby i czasy blokady są przechowywane w `localStorage` pod kluczem `failedLogins`.
 *   - Funkcje `getFailedLogins`, `saveFailedLogins`, `isEmailLockedOut`, `getRemainingLockoutTime` i `recordFailedAttempt` z `@/lib/functions` zarządzają logiką blokady.
 *   - Po udanym logowaniu rekordy nieudanych prób dla danego emaila są usuwane.
 * - **Powiadomienia**:
 *   - Wykorzystuje bibliotekę `sonner` do wyświetlania powiadomień o sukcesie (`toast.success`) lub błędzie (`toast.error`) z czasem trwania 3000ms (5000ms dla blokady).
 * - **Stany**:
 *   - `login`: Wartość pola login/email.
 *   - `password`: Wartość pola hasła.
 *   - `masterkey` i `masterkey2`: Wartości pól klucza głównego.
 *   - `isLoading`: Stan ładowania podczas wysyłania formularza.
 *   - `errorMessage`: Komunikat błędu wyświetlany pod formularzem.
 *   - `isResetDialogOpen`: Stan otwarcia dialogu resetowania hasła.
 * - **Zachowanie**:
 *   - Przy błędach walidacji lub logowania wyświetlane są komunikaty błędu i powiadomienia.
 *   - Po udanym logowaniu użytkownik jest przekierowywany na stronę główną (`/`).
 *   - Klucz główny (`masterkey`) jest szyfrowany za pomocą `encryptMasterkey` i zapisywany w `localStorage`.
 * - **Zewnętrzne zależności**:
 *   - Komponent używa `react-router-dom` do nawigacji i linków.
 *   - Integruje `ResetPasswordDialog` do obsługi resetowania hasła.
 *   - Używa komponentów UI z `@/components/ui` (np. `Button`, `Input`, `Label`).
 * - **Uwagi dotyczące bezpieczeństwa**:
 *   - Przechowywanie nieudanych prób w `localStorage` jest podatne na manipulacje; w produkcji należy używać backendu.
 *   - Szyfrowanie klucza głównego powinno być bezpieczne i zgodne z najlepszymi praktykami.
 *
 * @see {@link encryptMasterkey} - Funkcja szyfrowania klucza (`encryptMasterkey`).
 * @see {@link ResetPasswordDialog} - Dialog resetowania hasła.
 * @see {@link validateEmail} - Funkcja walidacji `validateEmail`.
 * @see {@link validatePassword} - Funkcja walidacji `validatePassword`.
 */
export function LoginForm({
  loginUser,
  resetPasswordSubmit,
  className,
  ...props
}: LoginFormProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [masterkey, setMasterkey] = useState("");
  const [masterkey2, setMasterkey2] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();
 

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    const emValidation = validateEmail(login);
    if(emValidation) {
      setErrorMessage(emValidation);
      setIsLoading(false);
      toast.error("Błąd walidacji!", {
        description: emValidation,
        duration: 3000,
      });
      return;
    }
    const passwordValidation = validatePassword(password);
    if(passwordValidation) {
      setErrorMessage(passwordValidation);
      setIsLoading(false);
      toast.error("Błąd walidacji!", {
        description: passwordValidation,
        duration: 3000,
      });
      return;
    }

    // Check if email is locked out
    if (isEmailLockedOut(login)) {
      const remainingTime = getRemainingLockoutTime(login);
      setErrorMessage(
        `Zbyt wiele nieudanych prób logowania. Spróbuj ponownie za ${Math.ceil(
          remainingTime / 60
        )} minut.`
      );
      setIsLoading(false);
      toast.error("Konto zablokowane!", {
        description: `Spróbuj ponownie za ${Math.ceil(remainingTime / 60)} minut.`,
        duration: 5000,
      });
      return;
    }

    if (masterkey !== masterkey2) {
      setErrorMessage("Masterkey i jego potwierdzenie muszą być identyczne.");
      setIsLoading(false);
      recordFailedAttempt(login); // Record failed attempt
      toast.error("Błąd walidacji!", {
        description: "Masterkey i jego potwierdzenie muszą być identyczne.",
        duration: 3000,
      });
      return;
    }

    setErrorMessage("");

    try {
      localStorage.setItem("masterkey", await encryptMasterkey(masterkey, "123"));
      console.log("sprawdzamcaptche");
      if(executeRecaptcha==undefined) return;
      const token = await executeRecaptcha("submit_form");
      console.log("rt:", token.substring(0, 5));
      await loginUser(login, password, masterkey, token);
      toast.success("Zalogowano pomyślnie!", { duration: 3000 });
      navigate("/");
      // Clear failed attempts on successful login
      const failedLogins = getFailedLogins();
      delete failedLogins[login];
      saveFailedLogins(failedLogins);
    } catch (error) {
      recordFailedAttempt(login); 
      setErrorMessage("Nieprawidłowy login, hasło lub masterkey");
      setPassword("");
      setMasterkey("");
      setMasterkey2("");
      toast.error("Błąd logowania!", {
        description: "Sprawdź dane i spróbuj ponownie.",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={cn("flex flex-col gap-6", className)}
        noValidate
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Zaloguj się na swoje konto</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Wprowadź dane
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="login">Login</Label>
            <Input
              id="login"
              type="text"
              placeholder="user123@example.pl"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-3">
            <div className="flex items-center">
              <Label htmlFor="password">Hasło logowania</Label>
              <a
                href="#"
                className="ml-auto text-sm underline-offset-4 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  setIsResetDialogOpen(true);
                }}
              >
                Zapomniałeś hasła?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="masterkey">Masterkey (hasło szyfrowania)</Label>
            <Input
              id="masterkey"
              type="password"
              value={masterkey}
              onChange={(e) => setMasterkey(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="masterkey2">Masterkey (hasło szyfrowania)</Label>
            <Input
              id="masterkey2"
              type="password"
              value={masterkey2}
              onChange={(e) => setMasterkey2(e.target.value)}
              required
              disabled={isLoading}
            />
            {errorMessage && (
              <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logowanie..." : "Zaloguj"}
          </Button>
        </div>
        <div className="text-center text-sm">
          Nie masz jeszcze konta?{" "}
          <Link to="/register" className="underline underline-offset-4">
            Utwórz konto
          </Link>
        </div>
      </form>
      <ResetPasswordDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        resetPasswordSubmit={resetPasswordSubmit}
        executeRecaptcha={executeRecaptcha}
      />
      <Toaster />
    </>
  );
}