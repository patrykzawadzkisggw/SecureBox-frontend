import ActivityList from "@/components/ActivityList";
import { Chart } from "@/components/Chart";
import DashboardCards from "@/components/DashboardCards";
import RecentlyAdded from "@/components/RecentlyAdded";
import PageTemplate from "./PageTemplate"; 

export default function HomePage() {
  return (
    <PageTemplate title="Manager haseł">
      <div className="container mx-auto p-4 max-w-[1200px]">
        <h1 className="text-3xl font-bold tracking-tight select-none">Strona główna</h1>
        <div className="flex flex-col lg:flex-row md:space-x-8">
          <div className="w-full lg:w-11/16 mb-4 lg:mb-0">
            <DashboardCards />
          </div>
          <div className="w-full lg:w-5/16">
            <h2 className="text-xl font-bold mb-4 select-none">Aktywność w tygodniu</h2>
             <Chart />
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-[1200px] select-none">
        <div className="flex flex-col lg:flex-row md:space-x-8">
          <div className="w-full lg:w-11/16 mb-4 lg:mb-0 select-none">
             <RecentlyAdded />
          </div>
          <div className="w-full lg:w-5/16">
            <h2 className="text-xl font-bold mb-4">Ostatnie aktywności</h2>
          <ActivityList /> 
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}