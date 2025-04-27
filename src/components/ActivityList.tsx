import { cn } from "@/lib/utils";
import { extractDomain } from "@/lib/functions";
import { ActivityListProps } from "@/lib/interfaces";


/**
 * Komponent wyświetlający listę ostatnich aktywności użytkownika, takich jak logowania.
 * 
 * @function ActivityList
 * @param {ActivityListProps} props - Właściwości komponentu.
 * @param {Object|null} props.user - Obiekt użytkownika, określający, czy użytkownik jest zalogowany.
 * @param {Activity[]} props.logins - Tablica obiektów aktywności, zawierających szczegóły logowań.
 * @returns {JSX.Element} Lista ostatnich 5 aktywności użytkownika lub komunikat o stanie (np. "Zaloguj się", "Brak aktywności").
 * 
 * @example
 * ```tsx
 * import ActivityList from '@/components/ActivityList';
 * 
 * const user = { first_name: "abc", id: "67eb5b5d-4b18-482c-a338-f761e5086811", last_name: "xyz", login: "user123@gmail.com" };
 * const logins = [
 *   {
 *     time: "13:24",
 *     date: "Dziś",
 *     name: "https://int.pl/#/login-clear",
 *     email: "test@mail.pl",
 *     color: "bg-purple-500",
 *   },
 * ];
 * 
 * <ActivityList user={user} logins={logins} />
 * ```
 * 
 * @remarks
 * - Komponent wymaga, aby `user` był obiektem (lub `null`), aby określić, czy wyświetlić listę aktywności czy komunikat o logowaniu.
 * - `logins` powinno być tablicą obiektów zgodnych z interfejsem `Activity`, np. `{ time: string, date: string, name: string, email: string, color: string }`.
 * 
 * @see {@link ActivityListProps,Activity} - Definicja interfejsów `ActivityListProps` i `Activity`.
 */
export default function ActivityList({user, logins}: ActivityListProps)  {

  if (!user) {
    return <div className="text-center text-gray-500">Zaloguj się, aby zobaczyć aktywności.</div>;
  }

  return (
    <div className="space-y-4">
      {logins.length === 0 ? (
        <p className="text-center text-gray-500">Brak aktywności do wyświetlenia.</p>
      ) : (
        logins.map((activity, index) => (
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