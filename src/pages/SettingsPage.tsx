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
              <ExportToJSON zip={state.zip} passwords={state.passwords} loading={state.loading} setMasterkey={setMasterkey} encryptionKey={state.encryptionKey}/>
            </TabsContent>
            <TabsContent value="import">
              <ImportFromJSON addPassword={addPassword} updatePassword={updatePassword} loading={state.loading} passwords={state.passwords} fetchPasswords={fetchPasswords}/>
            </TabsContent>
            <TabsContent value="accountSettings">
              <UserProfile updateUser={updateUser} currentUser={state.currentUser} loading={state.loading}/>
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