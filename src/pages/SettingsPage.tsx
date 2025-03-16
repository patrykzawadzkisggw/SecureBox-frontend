import { AppSidebar } from "@/components/app-sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
export default function SettingsPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">
                    Manager haseł
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="">
           
          </div>
        </header>
        <div className="flex justify-center">
  <div className="flex flex-1 flex-col gap-4 px-4 py-10 max-w-4xl">
    <h1 className="text-3xl font-bold tracking-tight">Ustawienia</h1>
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="2fa">2FA</TabsTrigger>
        <TabsTrigger value="trusted">Zaufane urządzenia</TabsTrigger>
        <TabsTrigger value="export">export</TabsTrigger>
        <TabsTrigger value="import">import</TabsTrigger>
        <TabsTrigger value="accountSettings">konto</TabsTrigger>
      </TabsList>
      <TabsContent value="2fa">ekran werfikacji dwuetapowej.</TabsContent>
      <TabsContent value="trusted">lista zaufanych urządzeń</TabsContent>
      <TabsContent value="export">ekran pozwalajacy weksportowac hasla</TabsContent>
      <TabsContent value="import">ekran pozwalajacy zaimportowac hasla</TabsContent>
      <TabsContent value="accountSettings">ekran pozwalajacy zmienic ustawienia uzytkownika</TabsContent>
    </Tabs>
  </div>
</div>



      </SidebarInset>
    </SidebarProvider>
  )
}
