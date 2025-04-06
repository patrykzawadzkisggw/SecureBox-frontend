import { cn } from "@/lib/utils";
import { usePasswordContext } from "../data/PasswordContext";
import { extractDomain } from "@/lib/functions";

/**
 * Interfejs reprezentujący aktywność użytkownika.
 * @interface Activity
 * @property {string} time - Czas aktywności (np. "10:15").
 * @property {string} date - Data aktywności (np. "Dziś", "1 dzień").
 * @property {string} name - Nazwa strony lub aplikacji (np. "Twitter").
 * @property {string} email - Login użytkownika (np. "user123").
 * @property {string} color - Klasa CSS dla koloru (np. "bg-purple-500").
 */
export interface Activity {
  time: string;
  date: string;
  name: string;
  email: string;
  color: string;
}

/**
 * Formatuje dane aktywności na podstawie wpisu logowania.
 * @function formatActivity
 * @param {Object} entry - Wpis logowania.
 * @param {string} entry.timestamp - Timestamp w formacie ISO (np. "2023-10-01T10:15:00Z").
 * @param {string} entry.login - Login użytkownika (np. "user123").
 * @param {string} entry.page - Nazwa strony (np. "Twitter").
 * @returns {Activity} Sformatowana aktywność zgodna z interfejsem Activity.
 * @example
 * ```tsx
 * const entry = { timestamp: "2023-10-01T10:15:00Z", login: "user123", page: "Twitter" };
 * const activity = formatActivity(entry);
 * // Wynik: { time: "10:15", date: "Dziś", name: "Twitter", email: "user123", color: "bg-purple-500" }
 * ```
 */
export const formatActivity = (entry: { timestamp: string; login: string; page: string }): Activity => {
  const date = new Date(entry.timestamp);
  
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  let formattedDate = "";
  if (diffInDays === 0) {
    formattedDate = "Dziś";
    if (date.getDate() < now.getDate()) formattedDate = "Wczoraj";
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

/**
 * Komponent wyświetlający listę aktywności użytkownika.
 * Korzysta z kontekstu haseł (`usePasswordContext`) oraz funkcji `extractDomain`.
 * @function ActivityList
 * @returns {JSX.Element} Lista ostatnich 5 aktywności użytkownika lub komunikat o stanie.
 * @example
 * ```tsx
 * import ActivityList from './ActivityList';
 * <ActivityList />
 * ```
 * @see {@link ../data/PasswordContext.tsx} - Kontekst haseł
 * @see {@link "@/lib/functions"} - Funkcja extractDomain
 * @see {Activity} - Struktura danych aktywności
 * @see {formatActivity} - Formatowanie aktywności
 */
export default function ActivityList() {
  const { state } = usePasswordContext();

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