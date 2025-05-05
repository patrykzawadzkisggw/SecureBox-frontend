import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { toast, Toaster } from "sonner";
import { NavLink, useNavigate } from "react-router-dom";
import { validateEmail, validateLastName, validateName, validatePassword } from "@/lib/validators";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * Interfejs definiujący właściwości (props) dla komponentu `RegisterForm` w aplikacji SecureBox.
 * Rozszerza standardowe właściwości formularza HTML (`React.ComponentProps<"form">`) i dodaje niestandardową funkcję `addUser` do rejestracji użytkownika.
 * Służy do określania typu danych przekazywanych do formularza rejestracji, zapewniając bezpieczeństwo typów w TypeScript.
 *
 * @interface RegisterFormProps
 * @extends {React.ComponentProps<"form">}
 *
 * @example
 * ```tsx
 * import { RegisterForm } from "@/components/RegisterForm";
 * import { usePasswordContext } from "@/data/PasswordContext";
 *
 * const RegisterPage = () => {
 *   const { addUser } = usePasswordContext();
 *   return <RegisterForm addUser={addUser} className="custom-form" />;
 * };
 * ```
 *
 * @remarks
 * - **Zależności**: Wymaga `react` dla typu `React.ComponentProps<"form">`.
 * - **Rozszerzenie**:
 *   - Dziedziczy wszystkie właściwości elementu `<form>` (np. `className`, `onSubmit`, `id`), umożliwiając przekazywanie standardowych atrybutów HTML.
 *   - Dodaje niestandardową właściwość `addUser`, która jest wymagana dla logiki rejestracji.
 * - **Właściwości**:
 *   - `addUser`: Funkcja asynchroniczna odpowiedzialna za rejestrację użytkownika, przyjmująca dane użytkownika (imię, nazwisko, login, hasło) oraz token reCAPTCHA.
 *   - Inne właściwości (np. `className`, `onSubmit`) są dziedziczone z `React.ComponentProps<"form">` i mogą być używane do stylizacji lub obsługi zdarzeń.
 * - **Użycie**:
 *   - Interfejs jest używany w komponencie `RegisterForm` do typowania propsów, zapewniając, że `addUser` jest przekazywana jako funkcja zgodna z sygnaturą.
 *   - Zazwyczaj `addUser` pochodzi z kontekstu `PasswordContext`, który zarządza logiką autoryzacji i komunikacją z API.
 * - **Bezpieczeństwo**:
 *   - Typ `addUser` określa dokładne parametry wejściowe (`string` dla każdego pola i tokena), zapobiegając błędom typowania.
 *   - Funkcja `addUser` powinna być zabezpieczona po stronie serwera (np. walidacja tokena reCAPTCHA, hashowanie hasła) dla ochrony przed atakami.
 * - **Testowanie**:
 *   - Interfejs powinien być testowany w kontekście komponentu `RegisterForm` poprzez mockowanie `addUser` i sprawdzanie, czy jest wywoływana z poprawnymi argumentami.
 *   - Upewnij się, że wszystkie właściwości dziedziczone z `React.ComponentProps<"form">` (np. `className`) są poprawnie obsługiwane w testach.
 * - **Rozszerzalność**:
 *   - Interfejs może być rozszerzony o dodatkowe właściwości (np. `onSuccess`, `onError`) dla większej elastyczności komponentu `RegisterForm`.
 *   - Jeśli aplikacja wymaga dodatkowych pól rejestracji (np. numer telefonu), sygnatura `addUser` musi zostać zaktualizowana.
 */
interface RegisterFormProps extends React.ComponentProps<"form"> {
  addUser: (first_name: string, last_name: string, login: string, password: string, token: string) => Promise<void>;
}

/**
 * Formularz rejestracji użytkownika dla aplikacji SecureBox.
 * Umożliwia użytkownikowi wprowadzenie danych (imię, nazwisko, email, hasło) oraz akceptację regulaminu i polityki prywatności.
 * Wykorzystuje walidację danych, integrację z Google reCAPTCHA v3 oraz funkcję `addUser` z kontekstu do utworzenia konta.
 * Po udanej rejestracji wyświetla powiadomienie i przekierowuje użytkownika na stronę logowania.
 *
 * @function RegisterForm
 * @param {RegisterFormProps} props - Właściwości formularza.
 * @param {string} [props.className] - Dodatkowe klasy CSS dla formularza.
 * @param {(first_name: string, last_name: string, login: string, password: string, token: string) => Promise<void>} props.addUser - Funkcja do dodawania nowego użytkownika.
 * @returns {JSX.Element} Formularz rejestracji z polami, checkboxem i powiadomieniami.
 *
 * @example
 * ```tsx
 * import { RegisterForm } from "@/components/RegisterForm";
 * import { usePasswordContext } from "@/data/PasswordContext";
 * import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
 *
 * const RegisterPage = () => {
 *   const { addUser } = usePasswordContext();
 *   return (
 *     <GoogleReCaptchaProvider reCaptchaKey="your-site-key">
 *       <RegisterForm addUser={addUser} />
 *     </GoogleReCaptchaProvider>
 *   );
 * };
 * ```
 *
 * @remarks
 * - **Zależności**: Wymaga `react` (`useState`), komponentów UI (`Button`, `Input`, `Label`, `Checkbox`) z `@/components/ui`, `sonner` (`toast`, `Toaster`), `react-router-dom` (`NavLink`, `useNavigate`), funkcji walidujących z `@/lib/validators`, `react-google-recaptcha-v3` (`useGoogleReCaptcha`), funkcji `cn` z `@/lib/utils` oraz `lucide-react` (dla ikon w linkach).
 * - **Props**:
 *   - `addUser`: Funkcja asynchroniczna z kontekstu `PasswordContext`, przyjmująca dane użytkownika i token reCAPTCHA, odpowiedzialna za rejestrację.
 *   - `className`: Opcjonalne klasy CSS dla dostosowania stylów formularza.
 * - **Stan lokalny**:
 *   - `firstName`, `lastName`, `login`, `password`: Wartości pól formularza.
 *   - `termsAccepted`: Stan checkboxa akceptacji regulaminu i polityki prywatności.
 *   - `isLoading`: Flaga wskazująca, czy formularz jest w trakcie przetwarzania.
 *   - `errors`: Obiekt przechowujący błędy walidacji dla każdego pola i ogólny błąd rejestracji.
 * - **Walidacja**:
 *   - Używa funkcji z `@/lib/validators`:
 *     - `validateName`: Sprawdza poprawność imienia.
 *     - `validateLastName`: Sprawdza poprawność nazwiska.
 *     - `validateEmail`: Weryfikuje format adresu email.
 *     - `validatePassword`: Sprawdza siłę hasła (np. minimalna długość, znaki specjalne).
 *   - Dodatkowa walidacja checkboxa `termsAccepted` wymaga akceptacji regulaminu.
 *   - Błędy są wyświetlane pod odpowiednimi polami z atrybutami ARIA dla dostępności.
 * - **reCAPTCHA**: Integruje Google reCAPTCHA v3 poprzez `useGoogleReCaptcha`. Token jest generowany podczas wysyłania formularza (`executeRecaptcha("submit_form")`) i przekazywany do `addUser`.
 * - **Interakcje**:
 *   - Po udanej rejestracji wyświetla powiadomienie (`toast.success`) i resetuje formularz, przekierowując na `/login`.
 *   - W przypadku błędu (np. istniejący login) wyświetla powiadomienie (`toast.error`) i komunikat ogólny.
 *   - Przycisk jest wyłączany podczas ładowania (`isLoading`), zapobiegając wielokrotnym przesłaniom.
 * - **Stylizacja**: Używa Tailwind CSS (np. `flex`, `gap-6`, `text-red-500`) z funkcją `cn` dla dynamicznego łączenia klas. Formularz jest responsywny, z czytelnymi etykietami i komunikatami o błędach.
 * - **Dostępność**:
 *   - Pola formularza mają atrybuty `aria-invalid` i `aria-describedby` dla komunikatów o błędach.
 *   - Etykiety są powiązane z polami poprzez `htmlFor`.
 *   - Checkbox ma odpowiednie atrybuty ARIA dla dostępności.
 *   - Powiadomienia `sonner` powinny być testowane z czytnikami ekranu, aby zapewnić ogłaszanie komunikatów.
 *   - Linki (`NavLink`) do `/termsofservice`, `/privacy`, i `/login` są oznaczone podświetleniem (`underline-offset-4`) dla lepszej widoczności.
 * - **Bezpieczeństwo**:
 *   - reCAPTCHA v3 chroni przed botami, generując token weryfikacyjny.
 *   - Funkcja `addUser` powinna być zabezpieczona po stronie serwera (np. walidacja tokena reCAPTCHA, hashowanie hasła).
 *   - Hasło jest resetowane po błędzie rejestracji, aby zapobiec przypadkowemu ponownemu przesłaniu.
 *   - Email i hasło są walidowane po stronie klienta, ale wymagają dodatkowej walidacji serwerowej.
 * - **API**: Komponent wywołuje `addUser` dla rejestracji, które prawdopodobnie komunikuje się z serwerem. Błędy (np. duplikat loginu) są obsługiwane w bloku `catch`.
 * - **Testowanie**: Komponent jest testowalny z `@testing-library/react`. Mockuj `useGoogleReCaptcha`, `addUser`, `useNavigate`, i funkcje walidujące. Testuj walidację pól, wysyłanie formularza, obsługę błędów, i powiadomienia. Zobacz `tests/components/RegisterForm.test.tsx` (jeśli istnieje).
 * - **Przekierowanie**: Po udanej rejestracji użytkownik jest przekierowywany na `/login` za pomocą `useNavigate`.
 * - **Rozszerzalność**:
 *   - Formularz może być rozszerzony o dodatkowe pola (np. numer telefonu, kod zaproszenia).
 *   - Checkbox mógłby obsługiwać osobne zgody (np. marketingowe) dla większej granularności.
 *   - Powiadomienia `sonner` mogą być dostosowane z dodatkowymi stylami lub akcjami.
 */
export function RegisterForm({ className, addUser, ...props }: RegisterFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false); // Nowy stan dla checkboxa
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    login: "",
    password: "",
    terms: "", // Nowy błąd dla checkboxa
    general: "",
  });
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({ firstName: "", lastName: "", login: "", password: "", terms: "", general: "" });

    // Walidacja pól
    const firstNameError = validateName(firstName);
    const lastNameError = validateLastName(lastName);
    const loginError = validateEmail(login);
    const passwordError = validatePassword(password);
    const termsError = termsAccepted ? "" : "Musisz zaakceptować regulamin i politykę prywatności.";

    if (firstNameError || lastNameError || loginError || passwordError || termsError) {
      setErrors({
        firstName: firstNameError,
        lastName: lastNameError,
        login: loginError,
        password: passwordError,
        terms: termsError,
        general: "",
      });
      setIsLoading(false);
      return;
    }

    if (executeRecaptcha == undefined) return;
    try {
      const token = await executeRecaptcha("submit_form");
      await addUser(firstName, lastName, login, password, token);
      toast.success("Konto utworzone!", {
        description: `Witaj, ${firstName} ${lastName}! Możesz się teraz zalogować.`,
        duration: 3000,
      });

      setFirstName("");
      setLastName("");
      setLogin("");
      setPassword("");
      setTermsAccepted(false); // Reset checkboxa
      navigate("/login");
    } catch (error) {
      console.error("Błąd rejestracji:", error);
      setErrors({
        ...errors,
        general: "Rejestracja nie powiodła się. Login może już istnieć lub dane są nieprawidłowe.",
      });
      setPassword("");
      toast.error("Błąd rejestracji!", {
        description: "Nie udało się utworzyć konta. Sprawdź dane i spróbuj ponownie.",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
      noValidate
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Utwórz nowe konto</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Wprowadź swoje dane, aby założyć konto
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="firstName">Imię</Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Imię"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            disabled={isLoading}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
          />
          {errors.firstName && (
            <p id="firstName-error" className="text-red-500 text-sm mt-1">
              {errors.firstName}
            </p>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="lastName">Nazwisko</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Nazwisko"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={isLoading}
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
          />
          {errors.lastName && (
            <p id="lastName-error" className="text-red-500 text-sm mt-1">
              {errors.lastName}
            </p>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="login">Email</Label>
          <Input
            id="login"
            type="email"
            placeholder="user123@example.pl"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
            disabled={isLoading}
            aria-invalid={!!errors.login}
            aria-describedby={errors.login ? "login-error" : undefined}
          />
          {errors.login && (
            <p id="login-error" className="text-red-500 text-sm mt-1">
              {errors.login}
            </p>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Hasło logowania</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password && (
            <p id="password-error" className="text-red-500 text-sm mt-1">
              {errors.password}
            </p>
          )}
        </div>
        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              disabled={isLoading}
              aria-invalid={!!errors.terms}
              aria-describedby={errors.terms ? "terms-error" : undefined}
            />
            <Label
              htmlFor="terms"
              className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Akceptuję{" "}
              <NavLink to="/termsofservice" className="underline underline-offset-4">
                regulamin
              </NavLink>{" "}
              i{" "}
              <NavLink to="/privacy" className="underline underline-offset-4">
                politykę prywatności
              </NavLink>
            </Label>
          </div>
          {errors.terms && (
            <p id="terms-error" className="text-red-500 text-sm mt-1">
              {errors.terms}
            </p>
          )}
        </div>
        <div className="grid gap-3">
          {errors.general && (
            <p className="text-red-500 text-sm mt-1">{errors.general}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Tworzenie konta..." : "Utwórz konto"}
        </Button>
      </div>
      <div className="text-center text-sm">
        Masz już konto?{" "}
        <NavLink to="/login" className="underline underline-offset-4">
          Zaloguj się
        </NavLink>
      </div>
      <Toaster />
    </form>
  );
}