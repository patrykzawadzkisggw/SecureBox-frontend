import React, { useState, useEffect } from "react";
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
 * Interfejs reprezentujący właściwości komponentu AddPasswordDialog.
 * @interface AddPasswordDialogProps
 * @property {boolean} isDialogOpen - Stan określający, czy dialog jest otwarty.
 * @property {React.Dispatch<React.SetStateAction<boolean>>} setIsDialogOpen - Funkcja ustawiająca stan otwarcia dialogu.
 */
export interface AddPasswordDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Obsługuje przesłanie formularza dodawania hasła.
 * Sprawdza poprawność danych i wywołuje funkcję `addPassword` z kontekstu.
 * @function handleSubmit
 * @param {string} platform - Nazwa platformy/strony.
 * @param {string} login - Login użytkownika.
 * @param {string} password - Hasło do dodania.
 * @param {Function} setError - Funkcja ustawiająca stan błędu.
 * @param {Function} setPlatform - Funkcja resetująca pole platformy.
 * @param {Function} setLogin - Funkcja resetująca pole loginu.
 * @param {Function} setPassword - Funkcja resetująca pole hasła.
 * @param {Function} setIsDialogOpen - Funkcja zamykająca dialog.
 * @param {Function} addPassword - Funkcja z kontekstu do dodawania hasła.
 * @returns {Promise<void>} Obietnica resolves, gdy hasło zostanie dodane lub reject z błędem.
 */
export const handleSubmit = async (
  platform: string,
  login: string,
  password: string,
  setError: React.Dispatch<React.SetStateAction<string>>,
  setPlatform: React.Dispatch<React.SetStateAction<string>>,
  setLogin: React.Dispatch<React.SetStateAction<string>>,
  setPassword: React.Dispatch<React.SetStateAction<string>>,
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  addPassword: (password: string, platform: string, login: string) => Promise<void>
) => {
  setError("");

  if (!platform.trim()) {
    setError("Pole 'Strona' nie może być puste.");
    toast.error("Błąd!", { description: "Pole 'Strona' nie może być puste.", duration: 3000 });
    return;
  }
  if (!login.trim()) {
    setError("Pole 'Login' nie może być puste.");
    toast.error("Błąd!", { description: "Pole 'Login' nie może być puste.", duration: 3000 });
    return;
  }
  if (!password.trim()) {
    setError("Pole 'Hasło' nie może być puste.");
    toast.error("Błąd!", { description: "Pole 'Hasło' nie może być puste.", duration: 3000 });
    return;
  }

  try {
    await addPassword(password, platform, login);
    toast.success("Sukces!", { description: "Hasło zostało dodane.", duration: 3000 });
    setPlatform("");
    setLogin("");
    setPassword("");
    setIsDialogOpen(false);
  } catch (error) {
    console.error("Błąd podczas dodawania hasła:", error);
    setError("Wystąpił błąd podczas dodawania hasła.");
    toast.error("Błąd!", {
      description: "Nie udało się dodać hasła. Spróbuj ponownie.",
      duration: 3000,
    });
  }
};

/**
 * Komponent dialogu do dodawania hasła.
 * Korzysta z kontekstu haseł (`usePasswordContext`) oraz biblioteki `toast` do wyświetlania powiadomień.
 * @function AddPasswordDialog
 * @param {AddPasswordDialogProps} props - Właściwości komponentu.
 * @param {boolean} props.isDialogOpen - Stan otwarcia dialogu.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setIsDialogOpen - Funkcja do zmiany stanu dialogu.
 * @returns {JSX.Element} Dialog z formularzem do dodawania hasła.
 * @example
 * ```tsx
 * import { AddPasswordDialog } from './AddPasswordDialog';
 * const [isOpen, setIsOpen] = useState(false);
 * <AddPasswordDialog isDialogOpen={isOpen} setIsDialogOpen={setIsOpen} />
 * ```
 * @see {@link ../data/PasswordContext.tsx} - Kontekst haseł
 * @see {@link https://www.npmjs.com/package/sonner} - Biblioteka toast
 * @see {handleSubmit} - Funkcja obsługująca przesłanie formularza
 */
export function AddPasswordDialog({ isDialogOpen, setIsDialogOpen }: AddPasswordDialogProps) {
  const [platform, setPlatform] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { addPassword } = usePasswordContext();

  useEffect(() => {
    if (isDialogOpen) {
      setError("");
      setPlatform("");
      setLogin("");
      setPassword("");
    }
  }, [isDialogOpen]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dodaj hasło</DialogTitle>
          <DialogDescription>Pozwala dodać hasło do managera haseł.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="platform" className="text-right">
              Strona
            </Label>
            <Input
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="col-span-3"
              placeholder="Wpisz nazwę strony"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="login" className="text-right">
              Login
            </Label>
            <Input
              id="login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="col-span-3"
              placeholder="Wpisz login"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Hasło
            </Label>
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="col-span-3"
              placeholder="Wpisz hasło"
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
          <Button
            onClick={() =>
              handleSubmit(
                platform,
                login,
                password,
                setError,
                setPlatform,
                setLogin,
                setPassword,
                setIsDialogOpen,
                addPassword
              )
            }
          >
            Dodaj
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}