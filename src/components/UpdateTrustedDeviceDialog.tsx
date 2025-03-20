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

interface UpdateTrustedDeviceDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  device: TrustedDevice;
}

export function UpdateTrustedDeviceDialog({
  isDialogOpen,
  setIsDialogOpen,
  device,
}: UpdateTrustedDeviceDialogProps) {
  const { addOrUpdateTrustedDevice } = usePasswordContext();
  const [isTrusted, setIsTrusted] = useState(device.is_trusted);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await addOrUpdateTrustedDevice(device.device_id, device.user_agent, isTrusted);
      setIsDialogOpen(false);
    } catch (error) {
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