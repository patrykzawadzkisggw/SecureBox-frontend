import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { encryptMasterkey, usePasswordContext } from "../data/PasswordContext";
import { ResetPasswordDialog } from "./ResetPasswordDialog";
import { Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";

/**
 * Obsługuje przesłanie formularza logowania.
 * Sprawdza poprawność danych i wywołuje funkcję `loginUser` z kontekstu.
 * @function handleSubmit
 * @param {React.FormEvent} e - Zdarzenie przesłania formularza.
 * @param {string} login - Login użytkownika.
 * @param {string} password - Hasło logowania.
 * @param {string} masterkey - Klucz główny (masterkey).
 * @param {string} masterkey2 - Potwierdzenie klucza głównego.
 * @param {Function} loginUser - Funkcja logowania z kontekstu.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setIsLoading - Funkcja ustawiająca stan ładowania.
 * @param {React.Dispatch<React.SetStateAction<string>>} setErrorMessage - Funkcja ustawiająca komunikat błędu.
 * @param {React.Dispatch<React.SetStateAction<string>>} setPassword - Funkcja resetująca hasło.
 * @param {React.Dispatch<React.SetStateAction<string>>} setMasterkey - Funkcja resetująca masterkey.
 * @param {ReturnType<typeof useNavigate>} navigate - Funkcja nawigacji.
 * @returns {Promise<void>} Obietnica resolves po zalogowaniu lub reject w przypadku błędu.
 */
export const handleSubmit = async (
  e: React.FormEvent,
  login: string,
  password: string,
  masterkey: string,
  masterkey2: string,
  loginUser: (login: string, password: string, masterkey: string) => Promise<void>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
  setPassword: React.Dispatch<React.SetStateAction<string>>,
  setMasterkey: React.Dispatch<React.SetStateAction<string>>,
  navigate: ReturnType<typeof useNavigate>
): Promise<void> => {
  e.preventDefault();
  setIsLoading(true);
  if (masterkey !== masterkey2) {
    setErrorMessage("Masterkey i jego potwierdzenie muszą być identyczne.");
    setIsLoading(false);
    return;
  }
  setErrorMessage("");

  try {
    localStorage.setItem("masterkey", await encryptMasterkey(masterkey, "123"));
    await loginUser(login, password, masterkey);
    toast.success("Zalogowano pomyślnie!", { duration: 3000 });
    navigate("/");
  } catch (error) {
    setErrorMessage("Nieprawidłowy login, hasło lub masterkey");
    setPassword("");
    setMasterkey("");
    toast.error("Błąd logowania!", {
      description: "Sprawdź dane i spróbuj ponownie.",
      duration: 3000,
    });
  } finally {
    setIsLoading(false);
  }
};

/**
 * Komponent formularza logowania.
 * Korzysta z kontekstu haseł (`usePasswordContext`) oraz biblioteki `toast` do wyświetlania powiadomień.
 * @function LoginForm
 * @param {React.ComponentProps<"form">} props - Właściwości formularza.
 * @param {string} [props.className] - Dodatkowe klasy CSS dla formularza.
 * @param {...any} props - Pozostałe właściwości formularza HTML.
 * @returns {JSX.Element} Formularz logowania z polami i opcjami resetowania hasła.
 * @example
 * ```tsx
 * import { LoginForm } from './LoginForm';
 * <LoginForm className="my-custom-class" />
 * ```
 * @see {@link "../data/PasswordContext"} - Kontekst haseł
 * @see {@link "https://www.npmjs.com/package/sonner"} - Biblioteka toast
 * @see {@link "./ResetPasswordDialog"} - Dialog resetowania hasła
 * @see {@link "react-router-dom"} - Biblioteka routingu
 * @see {handleSubmit} - Funkcja obsługująca przesłanie formularza
 */
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { login: loginUser } = usePasswordContext();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [masterkey, setMasterkey] = useState("");
  const [masterkey2, setMasterkey2] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <form
        onSubmit={(e) =>
          handleSubmit(
            e,
            login,
            password,
            masterkey,
            masterkey2,
            loginUser,
            setIsLoading,
            setErrorMessage,
            setPassword,
            setMasterkey,
            navigate
          )
        }
        className={cn("flex flex-col gap-6", className)}
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
              placeholder="user123"
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
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              Lub kontynuuj z
            </span>
          </div>
          <Button variant="outline" className="w-full" disabled={isLoading}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Zaloguj się używając Google
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
      />
      <Toaster />
    </>
  );
}