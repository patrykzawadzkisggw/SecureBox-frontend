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
import zxcvbn from "zxcvbn";

interface UpdatePasswordDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  platform: string;
  login: string;
}

export function UpdatePasswordDialog({
  isDialogOpen,
  setIsDialogOpen,
  platform,
  login,
}: UpdatePasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const [strength, setStrength] = useState(0);
  const { updatePassword } = usePasswordContext();


  useEffect(() => {
    if (newPassword) {
      const result = zxcvbn(newPassword);
      setStrength((result.score / 4) * 100);
    } else {
      setStrength(0);
    }
  }, [newPassword]);

  const handleSubmit = async () => {
    try {
      await updatePassword(newPassword, platform, login);
      setNewPassword("");
      setIsDialogOpen(false); 
    } catch (error) {
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Zmień hasło</DialogTitle>
          <DialogDescription>Zmień hasło dla {platform}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Login</Label>
            <div className="col-span-3 text-gray-800">{login}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="newPassword" className="text-right">
              Nowe hasło
            </Label>
            <Input
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              className="col-span-3"
            />
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
          <Button onClick={handleSubmit}>Zapisz</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}