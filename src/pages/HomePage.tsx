import { Chart } from "@/components/Chart";
import DashboardCards from "@/components/DashboardCards";
import RecentlyAdded from "@/components/RecentlyAdded";
import PageTemplate from "./PageTemplate"; 
import { usePasswordContext } from "@/data/PasswordContext";
import {  get5RecentActivities, processLoginData } from "@/lib/functions";
import ActivityList from "@/components/ActivityList";
import { useEffect, useState } from "react";
import { ChartData } from "@/lib/interfaces";


/**
 * Strona główna dla aplikacji SecureBox.
 * Wyświetla pulpit nawigacyjny z kartami informacyjnymi, wykresem aktywności tygodniowej, listą ostatnio dodanych haseł oraz ostatnimi aktywnościami użytkownika.
 * Wykorzystuje kontekst `PasswordContext` do zarządzania danymi użytkownika, hasłami i historią logowań.
 * Pobiera i przetwarza dane logowań do wykresu, korzystając z funkcji `getUserLogins` i `processLoginData`.
 * Jest owinięta w szablon `PageTemplate` dla spójnego układu.
 *
 * @function HomePage
 * @returns {JSX.Element} Strona główna z kartami, wykresem, listą haseł i aktywnościami.
 *
 * @example
 * ```tsx
 * import { HomePage } from "@/pages/HomePage";
 *
 * // W kontekście aplikacji z zaimplementowanym PasswordContext
 * <HomePage />
 * ```
 *
 * @remarks
 * - **Zależności**: Wymaga komponentów `Chart`, `DashboardCards`, `RecentlyAdded`, `ActivityList`, szablonu `PageTemplate`, kontekstu `usePasswordContext`, funkcji `get5RecentActivities` i `processLoginData` z `@/lib/functions`, oraz interfejsu `ChartData` z `@/lib/interfaces`. Używa `react` (`useEffect`, `useState`).
 * - **Kontekst**: Używa `usePasswordContext` do uzyskania:
 *   - `state`: Zawiera `currentUser` (dane użytkownika), `userLogins` (historia logowań), `history` (historia haseł), `passwords` (lista haseł), `token` (token autoryzacyjny).
 *   - `getUserLogins`: Funkcja pobierająca logowania użytkownika.
 *   - `addPassword`: Funkcja dodająca nowe hasło.
 * - **Stan lokalny**:
 *   - `chartData`: Przechowuje dane do wykresu (`ChartData[]`), przetwarzane przez `processLoginData`.
 *   - `hasFetched`: Flaga zapobiegająca wielokrotnemu pobieraniu danych logowań.
 * - **Efekty**:
 *   - `useEffect` uruchamia `fetchLogins` przy zmianie `state.currentUser?.id`, `state.token` lub `hasFetched`.
 *   - Sprawdza, czy istnieją logowania w `state.userLogins` dla bieżącego użytkownika; jeśli nie, wywołuje `getUserLogins` i przetwarza dane za pomocą `processLoginData`.
 *   - Obsługuje błędy, ustawiając `chartData` na pustą tablicę i logując błąd w konsoli.
 * - **Układ**:
 *   - Strona jest owinięta w `PageTemplate` z tytułem „Manager haseł”.
 *   - Dwa kontenery (`max-w-[1200px]`) dzielą treść na sekcje:
 *     - Górna sekcja: Karty (`DashboardCards`) i wykres aktywności (`Chart`) w układzie responsywnym (`lg:flex-row`).
 *     - Dolna sekcja: Lista ostatnio dodanych haseł (`RecentlyAdded`) i lista aktywności (`ActivityList`).
 *   - Proporcje szerokości w widoku desktopowym: 11/16 dla kart i listy haseł, 5/16 dla wykresu i listy aktywności.
 * - **Stylizacja**: Używa Tailwind CSS (np. `container`, `max-w-[1200px]`, `flex`, `text-3xl`, `select-none`) dla responsywnego i estetycznego układu.
 * - **Dostępność**:
 *   - Nagłówki (`h1`, `h2`) są czytelne dla czytników ekranu.
 *   - Klasa `select-none` na nagłówkach i sekcjach może utrudniać zaznaczanie tekstu; rozważ jej ograniczone użycie.
 *   - Upewnij się, że komponenty `Chart`, `DashboardCards`, `RecentlyAdded`, `ActivityList` mają odpowiednie atrybuty ARIA (np. `aria-label` dla interaktywnych elementów) – do zweryfikowania w ich dokumentacji.
 * - **Bezpieczeństwo**:
 *   - Dane logowań (`state.userLogins`) i haseł (`state.passwords`) powinny być szyfrowane (np. za pomocą masterkey).
 *   - Funkcja `getUserLogins` powinna używać `state.token` do autoryzacji żądań API, z walidacją po stronie serwera.
 *   - Funkcja `addPassword` powinna zabezpieczać dane przed nieautoryzowanym dostępem (np. poprzez walidację tokena).
 * - **API**:
 *   - Komponent wywołuje `getUserLogins` dla danych logowań, jeśli nie są dostępne w `state.userLogins`.
 *   - Funkcje `processLoginData` i `get5RecentActivities` przetwarzają dane lokalnie, ale ich implementacja powinna być zweryfikowana pod kątem poprawności.
 * - **Testowanie**: Komponent jest testowalny z `@testing-library/react`. Mockuj `usePasswordContext`, `getUserLogins`, `processLoginData`, `get5RecentActivities` oraz komponenty potomne (`Chart`, `DashboardCards`, `RecentlyAdded`, `ActivityList`). Testuj renderowanie sekcji, efekt pobierania danych, i obsługę błędów. Zobacz `tests/pages/HomePage.test.tsx` (jeśli istnieje).
 * - **Przekierowanie**: Komponent nie obsługuje bezpośredniej nawigacji, ale akcje w `DashboardCards` lub `RecentlyAdded` (np. po dodaniu hasła) mogą inicjować zmiany tras.
 * - **Rozszerzalność**: Struktura pozwala na dodanie nowych sekcji (np. statystyk użytkownika) lub rozszerzenie komponentów potomnych o dodatkowe funkcjonalności (np. filtry w `RecentlyAdded`).
 */
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