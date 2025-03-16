import ActivityList from "@/components/ActivityList"
import { AppSidebar } from "@/components/app-sidebar"
import { Chart } from "@/components/Chart"
import DashboardCards from "@/components/DashboardCards"
import { DataTable } from "@/components/DataTable"
import { NavActions } from "@/components/nav-actions"
import RecentlyAdded from "@/components/RecentlyAdded"
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
export default function HomePage() {
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
          <div className="flex justify-center">
           
          </div>
        </header>

        <div className="container mx-auto p-4 max-w-[1200px]">
        <h1 className="text-3xl font-bold tracking-tight">Strona główna</h1>
      <div className="flex flex-col lg:flex-row md:space-x-8">
        {/* Kolumna 1 (3/4 szerokości) */}
        <div className="w-full lg:w-11/16   mb-4 lg:mb-0">
          
          <DashboardCards/>
        </div>

        {/* Kolumna 2 (1/4 szerokości) */}
        <div className="w-full lg:w-5/16 ">
        <h2 className="text-xl font-bold mb-4">Aktywność w tygodniu</h2>
          <Chart />
        </div>
      </div>
    </div>
      
    <div className="container mx-auto p-4 max-w-[1200px]">
      <div className="flex flex-col lg:flex-row md:space-x-8">
        {/* Kolumna 1 (3/4 szerokości) */}
        <div className="w-full lg:w-11/16   mb-4 lg:mb-0">
          
          <RecentlyAdded />
        </div>

        {/* Kolumna 2 (1/4 szerokości) */}
        <div className="w-full lg:w-5/16 ">
          <h2 className="text-xl font-bold mb-4">Ostatnie aktywności</h2>
          <ActivityList />
        </div>
      </div>
    </div>


   


      </SidebarInset>
    </SidebarProvider>
  )
}
