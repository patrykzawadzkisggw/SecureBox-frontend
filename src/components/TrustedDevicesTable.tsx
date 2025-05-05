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

/**
 * Komponent tabeli wyświetlającej zaufane urządzenia w aplikacji SecureBox.
 * Prezentuje listę urządzeń powiązanych z kontem użytkownika, ich User Agent oraz status zaufania.
 * Umożliwia zmianę statusu zaufania poprzez menu kontekstowe i otwarcie dialogu `UpdateTrustedDeviceDialog`.
 * Wykorzystuje kontekst `PasswordContext` do pobierania danych o urządzeniach i stanu ładowania.
 *
 * @function TrustedDevicesTable
 * @returns {JSX.Element} Tabela z listą zaufanych urządzeń lub komunikat o ładowaniu/braku urządzeń.
 *
 * @example
 * ```tsx
 * import TrustedDevicesTable from "@/components/TrustedDevicesTable";
 *
 * // W komponencie nadrzędnym, np. SettingsPage
 * const SettingsPage = () => (
 *   <div>
 *     <TrustedDevicesTable />
 *   </div>
 * );
 * ```
 *
 * @remarks
 * - **Zależności**: Wymaga `react` (`useState`), komponentów UI (`Button`, `Table`, `DropdownMenu`) z `@/components/ui`, ikony `MoreHorizontal` z `lucide-react`, kontekstu `usePasswordContext` z `../data/PasswordContext`, komponentu `UpdateTrustedDeviceDialog`, oraz typu `TrustedDevice` z `../data/PasswordContext`.
 * - **Kontekst**: Używa `usePasswordContext` do uzyskania:
 *   - `state.trustedDevices`: Lista urządzeń (`TrustedDevice[]`) z polami `device_id`, `user_agent`, `is_trusted`.
 *   - `state.loading`: Flaga wskazująca, czy dane są w trakcie ładowania.
 * - **Stan lokalny**:
 *   - `isUpdateDialogOpen`: Flaga określająca, czy dialog aktualizacji (`UpdateTrustedDeviceDialog`) jest otwarty.
 *   - `selectedDevice`: Wybrane urządzenie (`TrustedDevice | null`) do edycji w dialogu.
 * - **Interakcje**:
 *   - Tabela wyświetla urządzenia z kolumnami: User Agent, Status zaufania, Akcje.
 *   - Menu kontekstowe (`DropdownMenu`) pozwala na zmianę statusu zaufania poprzez otwarcie dialogu.
 *   - Przy braku urządzeń wyświetla komunikat „Brak zaufanych urządzeń”.
 *   - Podczas ładowania danych pokazuje komunikat „Ładowanie...”.
 * - **Stylizacja**: Używa Tailwind CSS (np. `p-6`, `rounded-md`, `text-gray-800`) dla responsywnego i nowoczesnego wyglądu. Tabela ma obramowanie (`border`) i jest zawarta w kontenerze z paddingiem.
 * - **Dostępność**:
 *   - Menu kontekstowe zawiera tekst „Otwórz menu” dla czytników ekranu (`sr-only`).
 *   - Komponenty `Table` i `DropdownMenu` z Shadcn/UI wspierają nawigację klawiaturą i ARIA.
 *   - Przycisk menu (`Button`) ma odpowiedni fokus i jest dostępny dla użytkowników klawiatury.
 *   - Rozważ dodanie `aria-label` do ikony `MoreHorizontal` (np. „Otwórz opcje dla urządzenia {device_id}”).
 *   - Komunikat „Brak zaufanych urządzeń” zajmuje wszystkie kolumny (`colSpan={4}`), co może wymagać testów z czytnikami ekranu.
 * - **Bezpieczeństwo**:
 *   - Dane urządzeń (`state.trustedDevices`) pochodzą z `PasswordContext`, który powinien zapewniać bezpieczne pobieranie (np. za pomocą uwierzytelnionego API).
 *   - User Agent (`user_agent`) jest wyświetlany bezpośrednio, ale powinien być oczyszczony z potencjalnie złośliwych znaków po stronie serwera.
 *   - Dialog aktualizacji (`UpdateTrustedDeviceDialog`) powinien wymagać uwierzytelnienia dla zmian statusu.
 * - **Testowanie**: Komponent jest testowalny z `@testing-library/react`. Mockuj `usePasswordContext`, `UpdateTrustedDeviceDialog`, i dane urządzeń. Testuj renderowanie tabeli, menu kontekstowe, otwieranie dialogu oraz stany ładowania/braku urządzeń. Zobacz `tests/components/TrustedDevicesTable.test.tsx` (jeśli istnieje).
 * - **Przekierowanie**: Komponent nie obsługuje bezpośrednich przekierowań, ale dialog aktualizacji może inicjować zmiany w stanie aplikacji.
 * - **Rozszerzalność**:
 *   - Tabela może być rozszerzona o dodatkowe kolumny (np. data dodania, lokalizacja urządzenia).
 *   - Menu kontekstowe może zawierać więcej opcji (np. „Usuń urządzenie”, „Zablokuj urządzenie”).
 *   - Komponent może obsługiwać paginację lub filtrowanie dla dużej liczby urządzeń.
 */
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