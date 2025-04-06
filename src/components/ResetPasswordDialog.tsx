import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

/**
 * Interfejs reprezentujący właściwości komponentu ResetPasswordDialog.
 */
interface ResetPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Komponent dialogu do resetowania hasła.
 * Korzysta z biblioteki `toast` do wyświetlania powiadomień.
 */
export function ResetPasswordDialog({ isOpen, onClose }: ResetPasswordDialogProps) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  /**
   * Waliduje adres email.
   * @param email Adres email do walidacji.
   * @returns `true` jeśli email jest poprawny, w przeciwnym razie `false`.
   */
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Obsługuje przesłanie formularza resetowania hasła.
   * Sprawdza poprawność adresu email i wywołuje funkcję wysyłania linku resetującego.
   */
  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      setEmailError("Proszę wprowadzić poprawny adres email.");
      return;
    }

    setEmailError("");
    setIsLoading(true);

    try {
      

      await axios.post(`${import.meta.env.VITE_API_URL}/users/reset-password/`,{
        "login": email
      });
      setIsSent(true);
      toast.success("Link do resetowania hasła został wysłany!", {
        description: `Sprawdź swoją skrzynkę: ${email}`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Błąd wysyłania linku:", error);
      toast.error("Błąd!", {
        description: "Nie udało się wysłać linku do resetowania hasła.",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Obsługuje zamknięcie dialogu.
   * Resetuje stan komponentu.
   */
  const handleClose = () => {
    setEmail("");
    setEmailError("");
    setIsSent(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resetowanie hasła</DialogTitle>
          <DialogDescription>
            {isSent
              ? "Link do resetowania hasła został wysłany na podany adres email."
              : "Podaj adres email, na który wyślemy link do resetowania hasła."}
          </DialogDescription>
        </DialogHeader>
        {!isSent ? (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                className="col-span-3"
                disabled={isLoading}
              />
            </div>
            {emailError && (
              <p className="text-red-500 text-sm text-center">{emailError}</p>
            )}
          </div>
        ) : null}
        <DialogFooter>
          {!isSent ? (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Anuluj
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Wysyłanie..." : "Wyślij"}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>Zamknij</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
