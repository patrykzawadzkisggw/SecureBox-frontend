import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { usePasswordContext } from "../data/PasswordContext";
import { toast, Toaster } from "sonner";
import { NavLink, useNavigate } from "react-router-dom";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { addUser } = usePasswordContext();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

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
      setErrorMessage("Rejestracja nie powiodła się. Login może już istnieć lub dane są nieprawidłowe.");
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
            placeholder="imie"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="lastName">Nazwisko</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="nazwisko"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
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
          <Label htmlFor="password">Hasło logowania</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}"
            title="Hasło musi mieć min. 8 znaków, dużą i małą literę, cyfrę oraz znak specjalny!"
            required
            disabled={isLoading}
          />
        </div>
        <div className="grid gap-3">
          {errorMessage && (
            <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
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