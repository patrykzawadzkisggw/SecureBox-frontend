import React, { useState } from "react";
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
import {  usePasswordContext } from "../data/PasswordContext";
import { toast } from "sonner";
import axios from "axios";
import { decryptPassword, encryptPassword,deriveEncryptionKeyFromMasterkey, encryptMasterkey, decryptMasterkey } from "../data/PasswordContext";
import JSZip from "jszip";

/**
 * Interfejs reprezentujący właściwości komponentu UpdateMasterkeyDialog.
 */
interface UpdateMasterkeyDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Komponent dialogu do aktualizacji masterkey.
 * Korzysta z kontekstu haseł (`usePasswordContext`) oraz biblioteki `toast` do wyświetlania powiadomień.
 */
export function UpdateMasterkeyDialog({
  isDialogOpen,
  setIsDialogOpen,
}: UpdateMasterkeyDialogProps) {
  const [oldMasterkey, setOldMasterkey] = useState("");
  const [newMasterkey, setNewMasterkey] = useState("");
  const [confirmNewMasterkey, setConfirmNewMasterkey] = useState("");
  const [error, setError] = useState("");
  const { state,  } = usePasswordContext();

  /**
   * Obsługuje przesłanie formularza aktualizacji masterkey.
   * Sprawdza poprawność danych i wywołuje funkcje `decryptMasterkey`, `deriveEncryptionKeyFromMasterkey`, `decryptPassword`, `encryptPassword`, `encryptMasterkey` z kontekstu.
   */
  const handleSubmit = async () => {
    setError("");

    if (!oldMasterkey || !newMasterkey || !confirmNewMasterkey) {
      setError("Wszystkie pola są wymagane.");
      return;
    }
    if (newMasterkey !== confirmNewMasterkey) {
      setError("Nowe hasło masterkey i jego potwierdzenie muszą być identyczne.");
      return;
    }

    try {
      if (!state.currentUser ||  !state.token) {
        throw new Error("Brak danych użytkownika lub tokenu.");
      }
      const [zipResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/passwords/${state.currentUser.id}/files`, {
          responseType: "blob",
          headers: { Authorization: `Bearer ${state.token}` },
        })
      ]);

      const loadedZip = await JSZip.loadAsync(zipResponse.data);
        if (!loadedZip) {
            throw new Error("Nie udało się załadować plików z serwera.");
        }

      const encryptedMasterkey = localStorage.getItem(`masterkey`);
      if (!encryptedMasterkey) {
        throw new Error("Brak masterkey w localStorage.");
      }
      const decryptedOldMasterkey = await decryptMasterkey(encryptedMasterkey, "123");
      if (decryptedOldMasterkey !== oldMasterkey) {
        setError("Podane stare masterkey jest nieprawidłowe.");
        return;
      }

      const oldEncryptionKey = await deriveEncryptionKeyFromMasterkey(oldMasterkey);

      const passwordsToUpdate = [];
      for (const passwordEntry of state.passwords) {
        const encryptedData = await loadedZip.file(passwordEntry.passwordfile)?.async("string");
        if (!encryptedData) {
          throw new Error(`Nie znaleziono pliku ${passwordEntry.passwordfile} w ZIP-ie`);
        }
        const [encrypted, iv] = encryptedData.split(":");
        const decryptedPassword = await decryptPassword(encrypted, iv, oldEncryptionKey);
        passwordsToUpdate.push({
          platform: passwordEntry.platform,
          login: passwordEntry.login,
          new_password: decryptedPassword,
        });
      }

      const newEncryptionKey = await deriveEncryptionKeyFromMasterkey(newMasterkey);
      const encryptedPasswords = await Promise.all(
        passwordsToUpdate.map(async (entry) => {
          const { encrypted, iv } = await encryptPassword(entry.new_password, newEncryptionKey);
          return {
            platform: entry.platform,
            login: entry.login,
            new_password: `${encrypted}:${iv}`,
          };
        })
      );

       await axios.put(
        `${import.meta.env.VITE_API_URL}/passwords/${state.currentUser.id}/passwords`,
        { passwordsall: encryptedPasswords },
        { headers: { Authorization: `Bearer ${state.token}` } }
      );
      toast.success("Masterkey zaktualizowany pomyślnie!", { duration: 3000 });
      setIsDialogOpen(false);
      const newEncryptedMasterkey = await encryptMasterkey(newMasterkey, state.currentUser.password);
      localStorage.setItem(`masterkey`, newEncryptedMasterkey);

      setOldMasterkey("");
      setNewMasterkey("");
      setConfirmNewMasterkey("");
    } catch (error) {
      console.error("Błąd aktualizacji masterkey:", error);
      setError("Nie udało się zaktualizować masterkey. Sprawdź dane i spróbuj ponownie.");
      toast.error("Błąd aktualizacji masterkey!", {
        description: (error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd."),
        duration: 3000,
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Zmień Masterkey</DialogTitle>
          <DialogDescription>Aktualizuj swoje hasło szyfrowania (masterkey).</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="oldMasterkey" className="text-right">Stare Masterkey</Label>
            <Input
              id="oldMasterkey"
              type="password"
              value={oldMasterkey}
              onChange={(e) => setOldMasterkey(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="newMasterkey" className="text-right">Nowe Masterkey</Label>
            <Input
              id="newMasterkey"
              type="password"
              value={newMasterkey}
              onChange={(e) => setNewMasterkey(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confirmNewMasterkey" className="text-right">Potwierdź nowe Masterkey</Label>
            <Input
              id="confirmNewMasterkey"
              type="password"
              value={confirmNewMasterkey}
              onChange={(e) => setConfirmNewMasterkey(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
          {error && <p className="text-red-500 text-sm col-span-4 text-center">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Anuluj</Button>
          <Button onClick={handleSubmit}>Zapisz</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
