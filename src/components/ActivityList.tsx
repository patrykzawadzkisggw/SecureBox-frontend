import { cn } from "@/lib/utils";

const activities = [
  { time: "13:40", date: "Dziś", name: "InvisionApp", email: "mw@newsite.com", color: "bg-purple-500" },
  { time: "10:05", date: "Dziś", name: "Apple", email: "ks@newsite.com", color: "bg-purple-500" },
  { time: "21:32", date: "1 dzień", name: "YouTube", email: "ja@newsite.com", color: "bg-yellow-500" },
  { time: "15:57", date: "2 dni", name: "Amazon", email: "jj@newsite.com", color: "bg-purple-500" },
];

export default function ActivityList() {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center space-x-4">
          {/* Czas */}
          <div className="text-right w-16">
            <p className="text-lg font-medium text-gray-800">{activity.time}</p>
            <p className="text-sm text-gray-500">{activity.date}</p>
          </div>

          {/* Separator */}
          <div className={cn("w-1 h-10 rounded-full", activity.color)} />

          {/* Treść */}
          <div>
            <p className="text-lg font-semibold text-gray-800">{activity.name}</p>
            <p className="text-sm text-purple-600">{activity.email}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
