import React, { useState, useEffect } from "react"; // Add useEffect import
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

interface AddPasswordDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AddPasswordDialog({ isDialogOpen, setIsDialogOpen }: AddPasswordDialogProps) {
  const [platform, setPlatform] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State for error message
  const { addPassword } = usePasswordContext();

  // Reset error and fields when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      setError(""); // Clear error message
      setPlatform(""); // Optional: Clear fields on reopen
      setLogin("");
      setPassword("");
    }
  }, [isDialogOpen]); // Trigger when isDialogOpen changes

  const handleSubmit = async () => {
    setError(""); // Reset error message before validation

    // Validation for empty fields
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