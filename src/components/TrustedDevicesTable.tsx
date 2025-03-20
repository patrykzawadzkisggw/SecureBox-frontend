import  { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePasswordContext } from "../data/PasswordContext";
import { UpdateTrustedDeviceDialog } from "./UpdateTrustedDeviceDialog";
import { TrustedDevice } from "../data/PasswordContext";

export default function TrustedDevicesTable() {
  const { state, } = usePasswordContext();
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<TrustedDevice | null>(null);

  const handleUpdateClick = (device: TrustedDevice) => {
    setSelectedDevice(device);
    setIsUpdateDialogOpen(true);
  };

  if (state.loading) {
    return <div className="text-center">Ładowanie...</div>;
  }

  return (
    <div className="w-full p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Zaufane urządzenia</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              
              <TableHead>User Agent</TableHead>
              <TableHead>Status zaufania</TableHead>
              <TableHead>Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.trustedDevices.length > 0 ? (
              state.trustedDevices.map((device) => (
                <TableRow key={device.device_id}>
                  
                  <TableCell>{device.user_agent}</TableCell>
                  <TableCell>{device.is_trusted ? "Zaufane" : "Niezaufane"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Otwórz menu</span>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Akcje</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleUpdateClick(device)}>
                          Zmień status
                        </DropdownMenuItem>
                        
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Brak zaufanych urządzeń.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {selectedDevice && (
        <UpdateTrustedDeviceDialog
          isDialogOpen={isUpdateDialogOpen}
          setIsDialogOpen={setIsUpdateDialogOpen}
          device={selectedDevice}
        />
      )}
    </div>
  );
}