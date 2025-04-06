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
 */
interface AddPasswordDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Komponent dialogu do dodawania hasła.
 * Korzysta z kontekstu haseł (`usePasswordContext`) oraz biblioteki `toast` do wyświetlania powiadomień.
 */
export function AddPasswordDialog({ isDialogOpen, setIsDialogOpen }: AddPasswordDialogProps) {
  const [platform, setPlatform] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const { addPassword } = usePasswordContext();

  /**
   * Resetuje pola formularza i błąd po otwarciu dialogu.
   */
  useEffect(() => {
    if (isDialogOpen) {
      setError(""); 
      setPlatform(""); 
      setLogin("");
      setPassword("");
    }
  }, [isDialogOpen]); 

  /**
   * Obsługuje przesłanie formularza dodawania hasła.
   * Sprawdza poprawność danych i wywołuje funkcję `addPassword` z kontekstu.
   */
  const handleSubmit = async () => {
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
          <Button onClick={handleSubmit}>Dodaj</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
