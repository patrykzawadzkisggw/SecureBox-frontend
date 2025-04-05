import { cn } from "@/lib/utils";
import { usePasswordContext } from "../data/PasswordContext";
import { extractDomain } from "@/lib/functions";

interface Activity {
  time: string; // np. "10:15"
  date: string; // np. "Dziś" lub "1 dzień"
  name: string; // np. "Twitter"
  email: string; // np. "user123"
  color: string; // np. "bg-purple-500"
}

export default function ActivityList() {
  const { state } = usePasswordContext();

  const formatActivity = (entry: { timestamp: string; login: string; page: string }): Activity => {
    
    const date = new Date(entry.timestamp);
    
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    let formattedDate = "";
    if (diffInDays === 0) {
      formattedDate = "Dziś";
      if(date.getDate() < now.getDate()) formattedDate = "Wczoraj";
    } else if (diffInDays === 1) {
      formattedDate = "1 dzień";
    } else {
      formattedDate = `${diffInDays} dni`;
    }
   // console.log(`${diffInDays} ${date.getDate()} ${date.getMonth()} ${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`)

    const time = date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      time,
      date: formattedDate,
      name: entry.page,
      email: entry.login,
      color: "bg-purple-500",
    };
  };

  const activities = state.currentUser
    ? state.userLogins
        .filter((entry) => state.currentUser && entry.user_id === state.currentUser.id)
        .map(formatActivity)
        .slice(-5) 
    : [];

  if (!state.currentUser) {
    return <div className="text-center text-gray-500">Zaloguj się, aby zobaczyć aktywności.</div>;
  }

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <p className="text-center text-gray-500">Brak aktywności do wyświetlenia.</p>
      ) : (
        activities.map((activity, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="text-right w-16">
              <p className="text-lg font-medium text-gray-800">{activity.time}</p>
              <p className="text-sm text-gray-500">{activity.date}</p>
            </div>
            <div className={cn("w-1 h-10 rounded-full", activity.color)} />
            <div>
              <p className="text-lg font-semibold text-gray-800">{extractDomain(activity.name)}</p>
              <p className="text-sm text-purple-600">{activity.email}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}