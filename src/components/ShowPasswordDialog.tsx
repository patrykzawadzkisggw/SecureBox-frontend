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
import { Label } from "@/components/ui/label";
import { usePasswordContext } from "../data/PasswordContext";
import zxcvbn from "zxcvbn";

interface ShowPasswordDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  passwordfile: string;
  platform: string;
  login: string;
}

export function ShowPasswordDialog({
  isDialogOpen,
  setIsDialogOpen,
  passwordfile,
  platform,
  login,
}: ShowPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState(0);
  const { state } = usePasswordContext();

  // Pobieranie hasła z ZIP-a i obliczanie siły
  useEffect(() => {
    const fetchPassword = async () => {
      if (!state.zip || !isDialogOpen) return;
      try {
        const extractedPassword = await state.zip.file(passwordfile)?.async("string");
        if (!extractedPassword) throw new Error("Hasło nie znalezione w ZIP");
        const trimmedPassword = extractedPassword.trim();
        setPassword(trimmedPassword);

        const result = zxcvbn(trimmedPassword);
        setStrength((result.score / 4) * 100);
      } catch (error) {
        console.error("Błąd odczytu hasła:", error);
      }
    };

    fetchPassword();
  }, [isDialogOpen, passwordfile, state.zip]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pokaż hasło</DialogTitle>
          <DialogDescription>Podgląd hasła dla {platform}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Login</Label>
            <div className="col-span-3 text-gray-800">{login}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Hasło</Label>
            <div className="col-span-3 text-gray-800">{password || "Ładowanie..."}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Siła hasła</Label>
            <div className="col-span-3">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${strength}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">{strength.toFixed(0)}%</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setIsDialogOpen(false)}>Zamknij</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}