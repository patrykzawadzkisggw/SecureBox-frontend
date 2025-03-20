"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePasswordContext } from "../data/PasswordContext";

interface Activity {
  time: string; // np. "10:15"
  date: string; // np. "Dziś" lub "1 dzień"
  name: string; // np. "Twitter"
  email: string; // np. "user123"
  color: string; // np. "bg-purple-500"
}

export default function ActivityList() {
  const { state, getUserLogins } = usePasswordContext();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatActivity = (entry: { timestamp: string; login: string; page: string }): Activity => {
    const date = new Date(entry.timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    let formattedDate = "";
    if (diffInDays === 0) {
      formattedDate = "Dziś";
    } else if (diffInDays === 1) {
      formattedDate = "1 dzień";
    } else {
      formattedDate = `${diffInDays} dni`;
    }

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

  useEffect(() => {
    const fetchLogins = async () => {
      if (!state.currentUser || !state.token) {
        setIsLoading(false);
        return;
      }

      try {
        const userId = state.currentUser.id;
        const logins = await getUserLogins(userId);
        const formattedActivities = logins.map(formatActivity);
        formattedActivities.length = Math.min(formattedActivities.length, 5); // Limit do 5 ostatnich
        setActivities(formattedActivities);
        toast.success("Pobrano aktywności!");
      } catch (error) {
        console.error("Błąd pobierania danych:", error);
        toast.error("Nie udało się pobrać aktywności.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogins();
  }, [state.currentUser, state.token, getUserLogins]);

  if (isLoading) {
    return <div className="text-center text-gray-500">Ładowanie...</div>;
  }

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
              <p className="text-lg font-semibold text-gray-800">{activity.name}</p>
              <p className="text-sm text-purple-600">{activity.email}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}