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
import zxcvbn from "zxcvbn";

/**
 * Interfejs dla właściwości komponentu `UpdatePasswordDialog`.
 *
 * @interface UpdatePasswordDialogProps
 * @property {boolean} isDialogOpen - Określa, czy okno dialogowe jest otwarte.
 * @property {React.Dispatch<React.SetStateAction<boolean>>} setIsDialogOpen - Funkcja do zmiany stanu otwarcia okna dialogowego.
 * @property {string} platform - Nazwa platformy, dla której zmieniane jest hasło.
 * @property {string} login - Login użytkownika powiązany z hasłem.
 * @property {(newPassword: string, platform: string, login: string) => Promise<void>} updatePassword - Asynchroniczna funkcja do aktualizacji hasła.
 */
interface UpdatePasswordDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  platform: string;
  login: string;
  updatePassword: (newPassword: string, platform: string, login: string) => Promise<void>;
}

/**
 * Komponent modalnego okna dialogowego do zmiany hasła dla określonej platformy i loginu.
 * Umożliwia użytkownikowi wprowadzenie nowego hasła, wyświetla jego siłę za pomocą paska postępu
 * oraz pozwala zapisać zmiany poprzez asynchroniczną funkcję `updatePassword`.
 * Wykorzystuje bibliotekę `zxcvbn` do oceny siły hasła.
 *
 * @param {Object} props - Właściwości komponentu.
 * @param {boolean} props.isDialogOpen - Określa, czy okno dialogowe jest otwarte.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setIsDialogOpen - Funkcja do zmiany stanu otwarcia okna dialogowego.
 * @param {string} props.platform - Nazwa platformy, dla której zmieniane jest hasło (np. "Facebook").
 * @param {string} props.login - Login użytkownika powiązany z hasłem.
 * @param {(newPassword: string, platform: string, login: string) => Promise<void>} props.updatePassword - Asynchroniczna funkcja do aktualizacji hasła.
 * @returns {JSX.Element} Element JSX reprezentujący okno dialogowe do zmiany hasła.
 * @example
 * ```tsx
 * import { UpdatePasswordDialog } from "@/components/UpdatePasswordDialog";
 *
 * function App() {
 *   const [isDialogOpen, setIsDialogOpen] = useState(false);
 *
 *   const handleUpdatePassword = async (newPassword: string, platform: string, login: string) => {
 *     console.log(`Updating password for ${platform}/${login}: ${newPassword}`);
 *   };
 *
 *   return (
 *     <UpdatePasswordDialog
 *       isDialogOpen={isDialogOpen}
 *       setIsDialogOpen={setIsDialogOpen}
 *       platform="Facebook"
 *       login="user@example.com"
 *       updatePassword={handleUpdatePassword}
 *     />
 *   );
 * }
 * ```
 */
export function UpdatePasswordDialog({
  isDialogOpen,
  setIsDialogOpen,
  platform,
  login,
  updatePassword,
}: UpdatePasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const [strength, setStrength] = useState(0);


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