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
 * Określa propsy wymagane do obsługi logowania, resetowania hasła oraz stylizacji formularza.
 *
 * @interface LoginFormProps
 * @extends {React.ComponentProps<"form">} Rozszerza standardowe właściwości formularza HTML.
 *
 * @example
 * ```tsx
 * import { LoginForm } from "@/components/LoginForm";
 *
 * const loginUser = async (login: string, password: string, masterkey: string, token: string) => {
 *   console.log("Logowanie:", login, password, masterkey, token);
 * };
 * const resetPasswordSubmit = async (email: string, token: string) => {
 *   console.log("Wysłano link resetowania dla:", email, token);
 * };
 *
 * <LoginForm loginUser={loginUser} resetPasswordSubmit={resetPasswordSubmit} className="custom-class" />
 * ```
 *
 * @remarks
 * - Właściwość `loginUser` jest funkcją asynchroniczną odpowiedzialną za uwierzytelnianie użytkownika.
 * - Właściwość `resetPasswordSubmit` jest funkcją asynchroniczną wysyłającą żądanie resetowania hasła.
 * - Właściwość `className` pozwala na dodanie niestandardowych klas CSS (używa `cn` z `@/lib/utils` dla Tailwind CSS).
 * - Wszystkie właściwości są wymagane, z wyjątkiem `className` i innych opcjonalnych propsów formularza.
 */
interface LoginFormProps extends React.ComponentProps<"form"> {

  /**
   * Asynchroniczna funkcja obsługująca logowanie użytkownika.
   * @param login - Adres email lub login użytkownika.
   * @param password - Hasło logowania.
   * @param masterkey - Klucz główny (hasło szyfrowania).
   * @param token - Token reCAPTCHA v3 dla weryfikacji.
   * @returns Obietnica oznaczająca zakończenie operacji logowania.
   */
  loginUser: (login: string, password: string, masterkey: string, token2: string) => Promise<void>;

  /**
   * Asynchroniczna funkcja wysyłająca żądanie resetowania hasła dla podanego adresu email.
   * @param email - Adres email użytkownika.
   * @param token - Token reCAPTCHA v3 dla weryfikacji.
   * @returns Obietnica oznaczająca zakończenie operacji.
   */
  resetPasswordSubmit: (email: string,token: string) => Promise<void>;
}

/**
 * Komponent formularza logowania dla aplikacji SecureBox.
 * Umożliwia użytkownikowi logowanie do systemu poprzez wprowadzenie loginu, hasła i klucza głównego (masterkey), z zabezpieczeniem Google reCAPTCHA v3.
 * Obsługuje walidację danych, mechanizm blokady konta po nieudanych próbach logowania oraz resetowanie hasła za pomocą dialogu.
 *
 * @function LoginForm
 * @param {LoginFormProps} props - Właściwości komponentu.
 * @returns {JSX.Element} Formularz logowania z polami, powiadomieniami i dialogiem resetowania hasła.
 *
 * @example
 * ```tsx
 * import { LoginForm } from "@/components/LoginForm";
 *
 * const loginUser = async (login: string, password: string, masterkey: string, token: string) => {
 *   // Logika logowania
 * };
 * const resetPasswordSubmit = async (email: string, token: string) => {
 *   // Logika resetowania hasła
 * };
 *
 * <LoginForm loginUser={loginUser} resetPasswordSubmit={resetPasswordSubmit} />
 * ```
 *
 * @remarks
 * - **Funkcjonalność**:
 *   - Formularz zawiera pola dla loginu (email), hasła logowania, klucza głównego (`masterkey`) i jego potwierdzenia (`masterkey2`).
 *   - Po udanym logowaniu użytkownik jest przekierowywany na stronę główną (`/`) za pomocą `react-router-dom`.
 *   - Klucz główny jest szyfrowany za pomocą `encryptMasterkey` i zapisywany w `localStorage`.
 *   - Po nieudanych próbach logowania rejestruje błędy i blokuje konto po 5 próbach na 10 minut.
 * - **Walidacja**:
 *   - Pole `login` jest walidowane za pomocą `validateEmail` z `@/lib/validators`.
 *   - Pole `password` jest walidowane za pomocą `validatePassword` z `@/lib/validators`.
 *   - Pola `masterkey` i `masterkey2` muszą być identyczne; w przeciwnym razie wyświetlany jest błąd.
 *   - Błędy walidacji są wyświetlane jako powiadomienia (`sonner`) i komunikat pod formularzem.
 * - **Blokada konta**:
 *   - Mechanizm blokady używa `localStorage` do przechowywania nieudanych prób (`failedLogins`).
 *   - Funkcje `getFailedLogins`, `saveFailedLogins`, `isEmailLockedOut`, `getRemainingLockoutTime` i `recordFailedAttempt` z `@/lib/functions` zarządzają logiką.
 *   - Po 5 nieudanych próbach email jest blokowany na 10 minut; komunikat zawiera czas pozostały do odblokowania.
 *   - Po udanym logowaniu rekordy nieudanych prób dla danego emaila są usuwane.
 * - **reCAPTCHA**:
 *   - Integruje Google reCAPTCHA v3 za pomocą `useGoogleReCaptcha` z `react-google-recaptcha-v3`.
 *   - Token reCAPTCHA jest generowany asynchronicznie podczas wysyłania formularza (`executeRecaptcha`) i przekazywany do `loginUser` oraz `resetPasswordSubmit`.
 *   - W przypadku braku `executeRecaptcha` (np. błąd ładowania skryptu), proces logowania jest przerywany.
 * - **Powiadomienia**:
 *   - Używa biblioteki `sonner` do wyświetlania powiadomień (`toast.success` lub `toast.error`).
 *   - Powiadomienia mają czas trwania 3000ms (5000ms dla blokady konta) i zawierają opis błędu lub potwierdzenie sukcesu.
 * - **Stany**:
 *   - `login`: Wartość pola login/email.
 *   - `password`: Wartość pola hasła.
 *   - `masterkey` i `masterkey2`: Wartości pól klucza głównego.
 *   - `isLoading`: Stan ładowania podczas wysyłania formularza.
 *   - `errorMessage`: Komunikat błędu wyświetlany pod formularzem.
 *   - `isResetDialogOpen`: Stan otwarcia dialogu resetowania hasła (`ResetPasswordDialog`).
 * - **Układ i stylizacja**:
 *   - Używa Tailwind CSS poprzez `cn` z `@/lib/utils` dla responsywnego układu (`flex`, `gap-6`).
 *   - Formularz jest wyśrodkowany, z nagłówkiem, polami i przyciskiem w gridzie.
 *   - Zawiera link do rejestracji (`/register`) i opcję resetowania hasła.
 * - **Dostępność**:
 *   - Pola formularza mają etykiety (`Label`) powiązane z `htmlFor` dla zgodności z czytnikami ekranu.
 *   - Komunikaty błędów są wyświetlane w elemencie `<p>` z klasą `text-red-500` dla widoczności.
 *   - Link „Zapomniałeś hasła?” i „Utwórz konto” mają `underline-offset-4` dla lepszej widoczności.
 *   - Rozważ dodanie `aria-live="polite"` dla komunikatów błędów i `aria-describedby` dla pól formularza.
 *   - Dialog `ResetPasswordDialog` powinien być dostępny (sprawdź jego dokumentację).
 * - **Bezpieczeństwo**:
 *   - Przechowywanie nieudanych prób w `localStorage` jest podatne na manipulacje; w produkcji należy używać backendu z bezpiecznym magazynem (np. bazy danych).
 *   - Szyfrowanie klucza głównego (`encryptMasterkey`) powinno być zgodne z najlepszymi praktykami (np. używać silnych algorytmów jak AES).
 *   - Token reCAPTCHA chroni przed botami, ale powinien być weryfikowany po stronie serwera.
 *   - Funkcje `loginUser` i `resetPasswordSubmit` powinny mieć zabezpieczenia po stronie serwera (np. ochrona przed atakami brute-force, walidacja tokenów).
 *   - Klucz główny jest zapisywany w `localStorage` jako zaszyfrowany, ale rozważ użycie bezpieczniejszego magazynu (np. Secure Web Storage).
 * - **Zależności**:
 *   - Komponenty UI: `Button`, `Input`, `Label` z `@/components/ui`.
 *   - Funkcje: `encryptMasterkey` z `@/data/PasswordContext`, `validateEmail`, `validatePassword` z `@/lib/validators`, funkcje blokady z `@/lib/functions`.
 *   - Biblioteki: `react-router-dom` (`Link`, `useNavigate`), `sonner` (`toast`, `Toaster`), `react-google-recaptcha-v3` (`useGoogleReCaptcha`).
 *   - Komponent: `ResetPasswordDialog` dla resetowania hasła.
 * - **Testowanie**:
 *   - Komponent jest testowalny z `@testing-library/react`.
 *   - Mockuj: `useNavigate`, `useGoogleReCaptcha`, `encryptMasterkey`, `validateEmail`, `validatePassword`, funkcje blokady, `loginUser`, `resetPasswordSubmit`, i `ResetPasswordDialog`.
 *   - Testuj:
 *     - Renderowanie formularza, etykiet, pól, przycisku i linków.
 *     - Walidację pól (email, hasło, masterkey).
 *     - Mechanizm blokady konta (5 prób, czas blokady).
 *     - Generowanie i przekazywanie tokenu reCAPTCHA.
 *     - Wyświetlanie powiadomień (`sonner`) dla sukcesu i błędów.
 *     - Przekierowanie po udanym logowaniu (`navigate`).
 *     - Otwieranie i zamykanie dialogu resetowania hasła.
 *     - Obsługę błędów (np. nieprawidłowy login, brak `executeRecaptcha`).
 *   - Zobacz `tests/components/LoginForm.test.tsx` (jeśli istnieje).
 * - **API**:
 *   - Komponent nie wykonuje bezpośrednich żądań API, ale przekazuje dane do `loginUser` i `resetPasswordSubmit`, które prawdopodobnie komunikują się z serwerem.
 *   - Token reCAPTCHA powinien być weryfikowany po stronie serwera przed przetworzeniem żądania.
 * - **Przekierowanie**:
 *   - Po udanym logowaniu użytkownik jest przekierowywany na `/` za pomocą `useNavigate`.
 *   - Link do rejestracji prowadzi do `/register`.
 * - **Rozszerzalność**:
 *   - Możliwe dodanie dodatkowych pól (np. 2FA) lub opcji logowania (np. OAuth).
 *   - Dialog resetowania hasła można rozszerzyć o dodatkowe kroki (np. weryfikacja SMS).
 *   - Mechanizm blokady można przenieść na backend dla większej niezawodności.
 *
 * @see {@link encryptMasterkey} - Funkcja szyfrowania klucza głównego.
 * @see {@link ResetPasswordDialog} - Dialog resetowania hasła.
 * @see {@link validateEmail} - Funkcja walidacji emaila.
 * @see {@link validatePassword} - Funkcja walidacji hasła.
 * @see {@link useGoogleReCaptcha} - Hook do integracji z reCAPTCHA v3.
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