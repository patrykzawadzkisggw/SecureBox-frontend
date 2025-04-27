import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { toast, Toaster } from "sonner";
import { NavLink, useNavigate } from "react-router-dom";
import { validateEmail, validateLastName, validateName, validatePassword } from "@/lib/validators";


interface RegisterFormProps extends React.ComponentProps<"form"> {
  /**
   * Funkcja do rejestracji nowego użytkownika.
   * Przyjmuje dane użytkownika i zwraca Promise.
   * @param first_name - Imię użytkownika.
   * @param last_name - Nazwisko użytkownika.
   * @param login - Adres email użytkownika.
   * @param password - Hasło użytkownika.
   * @param masterkey - Klucz główny (stały w tej implementacji).
   * @returns Promise<void>
   */
  addUser: (first_name: string, last_name: string, login: string, password: string, masterkey: string) => Promise<void>;
}

/**
 * Komponent formularza rejestracji użytkownika.
 * Umożliwia wprowadzenie imienia, nazwiska, adresu email i hasła, a następnie rejestruje użytkownika za pomocą przekazanej funkcji `addUser`.
 * Przeprowadza walidację danych po stronie klienta i wyświetla komunikaty błędów dla nieprawidłowych danych.
 * Po udanej rejestracji przekierowuje użytkownika na stronę logowania i wyświetla powiadomienie o sukcesie.
 *
 * @function RegisterForm
 * @returns {JSX.Element} Formularz rejestracji użytkownika.
 *
 * @example
 * ```tsx
 * import { RegisterForm } from "@/components/RegisterForm";
 *
 * const mockAddUser = async (
 *   first_name: string,
 *   last_name: string,
 *   login: string,
 *   password: string,
 *   masterkey: string
 * ) => {
 *   console.log("Rejestracja:", { first_name, last_name, login, password, masterkey });
 * };
 *
 * <RegisterForm
 *   addUser={mockAddUser}
 *   className="p-4 max-w-md mx-auto"
 * />
 * ```
 */
export function RegisterForm({
  className,
  addUser,
  ...props
}: RegisterFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    login: "",
    password: "",
    general: "",
  });
  const navigate = useNavigate();

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({ firstName: "", lastName: "", login: "", password: "", general: "" });


    const firstNameError = validateName(firstName);
    const lastNameError = validateLastName(lastName);
    const loginError = validateEmail(login);
    const passwordError = validatePassword(password);

    if (firstNameError || lastNameError || loginError || passwordError) {
      setErrors({
        firstName: firstNameError,
        lastName: lastNameError,
        login: loginError,
        password: passwordError,
        general: "",
      });
      setIsLoading(false);
      return;
    }

    try {
      await addUser(firstName, lastName, login, password, "123");
      toast.success("Konto utworzone!", {
        description: `Witaj, ${firstName} ${lastName}! Możesz się teraz zalogować.`,
        duration: 3000,
      });

      setFirstName("");
      setLastName("");
      setLogin("");
      setPassword("");
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