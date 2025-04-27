import { Chart } from "@/components/Chart";
import DashboardCards from "@/components/DashboardCards";
import RecentlyAdded from "@/components/RecentlyAdded";
import PageTemplate from "./PageTemplate"; 
import { usePasswordContext } from "@/data/PasswordContext";
import {  get5RecentActivities, processLoginData } from "@/lib/functions";
import ActivityList from "@/components/ActivityList";
import { useEffect, useState } from "react";
import { ChartData } from "@/lib/interfaces";

export default function HomePage() {
  const { state, getUserLogins, addPassword } = usePasswordContext();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const activities = get5RecentActivities(state.currentUser, state.userLogins)
  const user = state.currentUser;
console.log(activities)
  useEffect(() => {
      const fetchLogins = async () => {
        if (!state.currentUser?.id || !state.token || hasFetched) {
          return;
        }
  
        try {
          const userId = state.currentUser.id;
  
          if (
            state.userLogins.length > 0 &&
            state.userLogins.some((entry) => entry.user_id === userId)
          ) {
            const processedData = processLoginData(state.userLogins);
            setChartData(processedData);
          } else {
            const logins = await getUserLogins(userId);
            const processedData = processLoginData(logins);
            setChartData(processedData);
          }
          setHasFetched(true);
        } catch (error) {
          console.error("Błąd pobierania danych:", error);
          setChartData([]);
          setHasFetched(true);
        }
      };
  
      fetchLogins();
    }, [state.currentUser?.id, state.token, hasFetched, getUserLogins]);



  return (
    <PageTemplate title="Manager haseł">
      <div className="container mx-auto p-4 max-w-[1200px]">
        <h1 className="text-3xl font-bold tracking-tight select-none">Strona główna</h1>
        <div className="flex flex-col lg:flex-row md:space-x-8">
          <div className="w-full lg:w-11/16 mb-4 lg:mb-0">
            <DashboardCards addPassword={addPassword} history={state.history} passwords={state.passwords}/>
          </div>
          <div className="w-full lg:w-5/16">
            <h2 className="text-xl font-bold mb-4 select-none">Aktywność w tygodniu</h2>
             <Chart user={user}  hasFetched={hasFetched} chartData={chartData}/>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-[1200px] select-none">
        <div className="flex flex-col lg:flex-row md:space-x-8">
          <div className="w-full lg:w-11/16 mb-4 lg:mb-0 select-none">
             <RecentlyAdded data={state.history} addPassword={addPassword} passwords={state.passwords}/>
          </div>
          <div className="w-full lg:w-5/16">
            <h2 className="text-xl font-bold mb-4">Ostatnie aktywności</h2>
          <ActivityList user={user} logins={activities}/> 
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}