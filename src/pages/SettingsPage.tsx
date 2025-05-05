import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ExportToJSON from "@/components/ExportToJSON";
import ImportFromJSON from "@/components/ImportFromJSON";
import UserProfile from "@/components/UserProfile";
import PageTemplate from "./PageTemplate";
import { UpdateMasterkeyDialog } from "@/components/UpdateMasterkeyDialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePasswordContext } from "@/data/PasswordContext";
import { updateMasterKey } from "@/lib/fn2";

/**
 * Komponent strony ustawień dla menedżera haseł.
 * Umożliwia użytkownikowi eksport/import haseł, zarządzanie profilem użytkownika oraz zmianę masterkey.
 * Wykorzystuje interfejs z zakładkami do organizacji różnych sekcji ustawień.
 *
 * @function SettingsPage
 * @returns {JSX.Element} Strona ustawień z zakładkami i formularzami.
 *
 * @example
 * ```tsx
 * import { SettingsPage } from '@/pages/SettingsPage';
 *
 * // W kontekście aplikacji z zaimplementowanym PasswordContext
 * <SettingsPage />
 * ```
 *
 * @remarks
 * - Komponent używa `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` z biblioteki UI do renderowania interfejsu z zakładkami.
 * - Zakładki obejmują:
 *   - **Export**: Umożliwia eksport haseł do pliku JSON z ostrzeżeniem o nieszyfrowanych danych.
 *   - **Import**: Umożliwia import haseł z pliku JSON, z aktualizacją istniejących kont i dodaniem nowych.
 *   - **Konto**: Zawiera formularz do aktualizacji profilu użytkownika oraz opcję zmiany masterkey.
 * - Komponent korzysta z kontekstu `PasswordContext` do zarządzania stanem aplikacji (użytkownik, hasła, masterkey).
 * - Funkcja `updateMasterKey` jest przekazywana do komponentu `UpdateMasterkeyDialog` w celu aktualizacji masterkey.
 * - Przycisk „Zmień Masterkey” otwiera dialog `UpdateMasterkeyDialog` do wprowadzenia nowego masterkey.
 * - Komponent jest owinięty w `PageTemplate`, który zapewnia spójny układ strony z tytułem „Manager haseł”.
 * - Stylizacja jest responsywna, z maksymalną szerokością treści ustawioną na `max-w-4xl`.
 * - Komentarze w kodzie wskazują na wyłączone zakładki (np. „2FA” i „Zaufane urządzenia”), które mogą być dodane w przyszłości.
 *
 * @see {@link ExportToJSON} - Komponent do eksportu haseł.
 * @see {@link ImportFromJSON} - Komponent do importu haseł.
 * @see {@link UserProfile} - Komponent do zarządzania profilem użytkownika.
 * @see {@link UpdateMasterkeyDialog} - Komponent dialogu do zmiany masterkey.
 * @see {@link PageTemplate} - Komponent szablonu strony.
 */
export default function SettingsPage() {
  const { state,updateUser, setMasterkey, addPassword, updatePassword, fetchPasswords  } = usePasswordContext();

  const [isMasterkeyDialogOpen, setIsMasterkeyDialogOpen] = useState(false);
  return (
    <PageTemplate title="Manager haseł">
      <div className="flex justify-center">
        <div className="flex flex-1 flex-col gap-4 px-4 py-10 max-w-4xl">
          <h1 className="text-3xl font-bold tracking-tight select-none">Ustawienia</h1>
            <Tabs defaultValue="export">
            <TabsList className="w-full select-none">
              {/*<TabsTrigger value="2fa">2FA</TabsTrigger>
               <TabsTrigger value="trusted">Zaufane urządzenia</TabsTrigger> */}
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="import">Import</TabsTrigger>
              <TabsTrigger value="accountSettings">Konto</TabsTrigger>
            </TabsList>
            {/*<TabsContent value="2fa">
            


            </TabsContent>
             <TabsContent value="trusted">
              <TrustedDevicesTable />
            </TabsContent> */}
            <TabsContent value="export">
            <h3 className="text-lg font-semibold text-gray-900">Ostrzeżenie przed eksportem haseł</h3>
            <p className="text-sm text-gray-600 mt-2 mb-4">
              Wyeksportowany plik JSON zawiera <strong>nieszyfrowane dane</strong>. Jesteś odpowiedzialny za jego
              bezpieczne przechowywanie. Zalecamy zapisanie pliku na zaszyfrowanym nośniku lub w innym bezpiecznym miejscu.
            </p>
              <ExportToJSON zip={state.zip} passwords={state.passwords} loading={state.loading} setMasterkey={setMasterkey} encryptionKey={state.encryptionKey}/>
            </TabsContent>
            <TabsContent value="import">
            <h3 className="text-lg font-semibold text-gray-900">Informacja o imporcie haseł</h3>
            <p className="text-sm text-gray-600 mt-2 mb-4">
              Import haseł doda <strong>nowe konta</strong> (strona i login) do Twojej bazy. Dla{' '}
              <strong>istniejących kont</strong> (ta sama strona i login) hasła zostaną zaktualizowane. Upewnij się, że
              plik JSON jest zgodny z formatem eksportu SecureBox.
            </p>
              <ImportFromJSON addPassword={addPassword} updatePassword={updatePassword} loading={state.loading} passwords={state.passwords} fetchPasswords={fetchPasswords}/>
            </TabsContent>
            <TabsContent value="accountSettings">
              <UserProfile updateUser={updateUser} currentUser={state.currentUser} loading={state.loading}/>

              <h3 className="text-lg font-semibold text-gray-900">Informacja o zmianie Masterkey</h3>
            <p className="text-sm text-gray-600 mt-2 mb-4">
              Po zmianie Masterkey musisz zaktualizować go w <strong>rozszerzeniu SecureBox</strong>, jeśli go używasz, aby
              zapewnić spójność. Zmiana Masterkey jest <strong>niemożliwa</strong>, jeśli używasz wielu Masterkey, ponieważ
              wymaga odszyfrowania i ponownego zaszyfrowania wszystkich haseł jednym kluczem. Upewnij się, że używasz
              jednego Masterkey.
            </p>
              <Button onClick={() => setIsMasterkeyDialogOpen(true)} className="select-none">Zmień Masterkey</Button>
            <UpdateMasterkeyDialog
            isDialogOpen={isMasterkeyDialogOpen}
            setIsDialogOpen={setIsMasterkeyDialogOpen}
            updatefn={updateMasterKey}
            currentUser={state.currentUser}
            passwords={state.passwords}
            token={state.token}
            />
            </TabsContent>
            </Tabs>
        </div>
      </div>
    </PageTemplate>
  );
}