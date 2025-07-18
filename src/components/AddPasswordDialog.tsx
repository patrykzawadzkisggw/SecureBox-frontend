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
import { toast } from "sonner";

/**
 * Interfejs reprezentujący właściwości komponentu AddPasswordDialog.
 * @interface AddPasswordDialogProps
 * @property {boolean} isDialogOpen - Stan określający, czy dialog jest otwarty.
 * @property {React.Dispatch<React.SetStateAction<boolean>>} setIsDialogOpen - Funkcja ustawiająca stan otwarcia dialogu.
 * @property {(password: string, platform: string, login: string) => Promise<void>} onSubmit - Funkcja wywoływana po przesłaniu formularza, zapisująca hasło.
 */
export interface AddPasswordDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: (password: string, platform: string, login: string) => Promise<void>;
}

/**
 * Obsługuje przesłanie formularza dodawania hasła.
 * Sprawdza poprawność danych wejściowych i wywołuje funkcję `addPassword` przekazaną w propsach.
 * Wyświetla powiadomienia za pomocą biblioteki `toast` w przypadku sukcesu lub błędu.
 * 
 * @function handleSubmit
 * @param {string} platform - Nazwa platformy lub strony (np. "example.com").
 * @param {string} login - Login użytkownika (np. "user@example.com").
 * @param {string} password - Hasło do zapisania.
 * @param {React.Dispatch<React.SetStateAction<string>>} setError - Funkcja ustawiająca komunikat błędu.
 * @param {React.Dispatch<React.SetStateAction<string>>} setPlatform - Funkcja resetująca pole platformy.
 * @param {React.Dispatch<React.SetStateAction<string>>} setLogin - Funkcja resetująca pole loginu.
 * @param {React.Dispatch<React.SetStateAction<string>>} setPassword - Funkcja resetująca pole hasła.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setIsDialogOpen - Funkcja zamykająca dialog.
 * @param {(password: string, platform: string, login: string) => Promise<void>} addPassword - Funkcja zapisująca hasło.
 * @returns {Promise<void>} Obietnica
 * 
 * @example
 * ```tsx
 * await handleSubmit(
 *   "example.com",
 *   "user@example.com",
 *   "password123",
 *   setError,
 *   setPlatform,
 *   setLogin,
 *   setPassword,
 *   setIsDialogOpen,
 *   async (password, platform, login) => {
 *     // Logika zapisu hasła
 *     console.log({ password, platform, login });
 *   }
 * );
 * ```
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
 * Komponent dialogowy do dodawania nowego hasła do managera haseł.
 * Zawiera formularz z polami dla strony, loginu i hasła, z walidacją i powiadomieniami.
 * 
 * @function AddPasswordDialog
 * @param {AddPasswordDialogProps} props - Właściwości komponentu.
 * @param {boolean} props.isDialogOpen - Stan określający, czy dialog jest otwarty.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setIsDialogOpen - Funkcja ustawiająca stan otwarcia dialogu.
 * @param {(password: string, platform: string, login: string) => Promise<void>} props.onSubmit - Funkcja zapisująca hasło.
 * @returns {JSX.Element} Dialog z formularzem do dodawania hasła.
 * 
 * @example
 * ```tsx
 * import { AddPasswordDialog } from '@/components/AddPasswordDialog';
 * 
 * const [isOpen, setIsOpen] = useState(false);
 * const handleSubmit = async (password: string, platform: string, login: string) => {
 *   // Logika zapisu hasła, np. wysyłka do API
 *   console.log({ password, platform, login });
 * };
 * 
 * <AddPasswordDialog
 *   isDialogOpen={isOpen}
 *   setIsDialogOpen={setIsOpen}
 *   onSubmit={handleSubmit}
 * />
 * ```
 * 
 * @remarks
 * - Komponent resetuje pola formularza i komunikat błędu przy każdym otwarciu dialogu (za pomocą `useEffect`).
 * - Walidacja sprawdza, czy pola `platform`, `login` i `password` nie są puste.
 * - Powiadomienia są wyświetlane za pomocą biblioteki `sonner` (sukces lub błąd).
 * - Funkcja `onSubmit` powinna obsługiwać zapis hasła, np. poprzez wywołanie API.
 * 
 * @see {@link https://www.npmjs.com/package/sonner} - Dokumentacja biblioteki `sonner` dla powiadomień.
 * @see {@link AddPasswordDialogProps} - Interfejs właściwości komponentu.
 * @see {@link handleSubmit} - Funkcja obsługująca przesłanie formularza.
 */
export function AddPasswordDialog({ isDialogOpen, setIsDialogOpen, onSubmit }: AddPasswordDialogProps) {
  const [platform, setPlatform] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


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
                onSubmit
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