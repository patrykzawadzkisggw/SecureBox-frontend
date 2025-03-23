import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ExportToJSON from "@/components/ExportToJSON";
import ImportFromJSON from "@/components/ImportFromJSON";
import UserProfile from "@/components/UserProfile";
import PageTemplate from "./PageTemplate";
import { UpdateMasterkeyDialog } from "@/components/UpdateMasterkeyDialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [isMasterkeyDialogOpen, setIsMasterkeyDialogOpen] = useState(false);
  return (
    <PageTemplate title="Manager haseł">
      <div className="flex justify-center">
        <div className="flex flex-1 flex-col gap-4 px-4 py-10 max-w-4xl">
          <h1 className="text-3xl font-bold tracking-tight select-none">Ustawienia</h1>
            <Tabs defaultValue="2fa">
            <TabsList className="w-full select-none">
              <TabsTrigger value="2fa">2FA</TabsTrigger>
              {/* <TabsTrigger value="trusted">Zaufane urządzenia</TabsTrigger> */}
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="import">Import</TabsTrigger>
              <TabsTrigger value="accountSettings">Konto</TabsTrigger>
            </TabsList>
            <TabsContent value="2fa">
            


            </TabsContent>
            {/* <TabsContent value="trusted">
              <TrustedDevicesTable />
            </TabsContent> */}
            <TabsContent value="export">
              <ExportToJSON />
            </TabsContent>
            <TabsContent value="import">
              <ImportFromJSON />
            </TabsContent>
            <TabsContent value="accountSettings">
              <UserProfile />
              <Button onClick={() => setIsMasterkeyDialogOpen(true)} className="select-none">Zmień Masterkey</Button>
            <UpdateMasterkeyDialog
            isDialogOpen={isMasterkeyDialogOpen}
            setIsDialogOpen={setIsMasterkeyDialogOpen}
            />
            </TabsContent>
            </Tabs>
        </div>
      </div>
    </PageTemplate>
  );
}