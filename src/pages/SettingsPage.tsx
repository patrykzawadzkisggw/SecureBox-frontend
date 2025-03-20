import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ExportToJSON from "@/components/ExportToJSON";
import ImportFromJSON from "@/components/ImportFromJSON";
import UserProfile from "@/components/UserProfile";
import PageTemplate from "./PageTemplate";

export default function SettingsPage() {
  return (
    <PageTemplate title="Manager haseł">
      <div className="flex justify-center">
        <div className="flex flex-1 flex-col gap-4 px-4 py-10 max-w-4xl">
          <h1 className="text-3xl font-bold tracking-tight">Ustawienia</h1>
          <Tabs defaultValue="2fa">
            <TabsList>
              <TabsTrigger value="2fa">2FA</TabsTrigger>
              {/* <TabsTrigger value="trusted">Zaufane urządzenia</TabsTrigger> */}
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="import">Import</TabsTrigger>
              <TabsTrigger value="accountSettings">Konto</TabsTrigger>
            </TabsList>
            <TabsContent value="2fa">Ekran weryfikacji dwuetapowej.</TabsContent>
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTemplate>
  );
}