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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePasswordContext, TrustedDevice } from "../data/PasswordContext";
import { toast } from "sonner";

/**
 * Interfejs reprezentujący właściwości komponentu UpdateTrustedDeviceDialog.
 */
interface UpdateTrustedDeviceDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  device: TrustedDevice;
}

/**
 * Komponent dialogu do aktualizacji statusu zaufania urządzenia.
 * Korzysta z kontekstu haseł (`usePasswordContext`) oraz biblioteki `toast` do wyświetlania powiadomień.
 */
export function UpdateTrustedDeviceDialog({
  isDialogOpen,
  setIsDialogOpen,
  device,
}: UpdateTrustedDeviceDialogProps) {
  const { addOrUpdateTrustedDevice } = usePasswordContext();
  const [isTrusted, setIsTrusted] = useState(device.is_trusted);
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Obsługuje aktualizację statusu zaufania urządzenia.
   * Wywołuje funkcję `addOrUpdateTrustedDevice` z kontekstu.
   */
  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await addOrUpdateTrustedDevice(device.device_id, device.user_agent, isTrusted);
      toast.success("Status zaufania zaktualizowany!", { duration: 3000 });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Błąd aktualizacji statusu zaufania:", error);
      toast.error("Błąd!", {
        description: "Nie udało się zaktualizować statusu zaufania. Spróbuj ponownie.",
        duration: 3000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Zmień status zaufania</DialogTitle>
          <DialogDescription>
            Zmień status zaufania dla urządzenia {device.device_id}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">ID urządzenia</Label>
            <div className="col-span-3 text-gray-800">{device.device_id}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">User Agent</Label>
            <div className="col-span-3 text-gray-800">{device.user_agent}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Zaufane</Label>
            <div className="col-span-3">
              <Switch
                checked={isTrusted}
                onCheckedChange={setIsTrusted}
                disabled={isUpdating}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isUpdating}>
            Anuluj
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
