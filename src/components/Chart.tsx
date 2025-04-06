import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { usePasswordContext } from "../data/PasswordContext";
import { toast } from "sonner";

/**
 * Interfejs reprezentujący dane wykresu.
 * @interface ChartData
 * @property {string} month - Dzień tygodnia (np. "Poniedzialek").
 * @property {number} logins - Liczba logowań w danym dniu.
 */
export interface ChartData {
  month: string;
  logins: number;
}

/**
 * Konfiguracja wykresu.
 * @type {ChartConfig}
 * @property {{label: string, color: string}} logins - Konfiguracja dla słupków logowań.
 */
export const chartConfig = {
  logins: {
    label: "Logowania",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

/**
 * Komponent wyświetlający wykres logowań użytkownika.
 * Korzysta z kontekstu haseł (`usePasswordContext`) oraz biblioteki `toast` do wyświetlania powiadomień.
 * @function Chart
 * @returns {JSX.Element} Wykres słupkowy z danymi logowań lub komunikaty o stanie (np. "Zaloguj się", "Ładowanie...").
 * @example
 * ```tsx
 * import { Chart } from './components/Chart';
 * <Chart />
 * ```
 * @see {@link https://recharts.org} - Dokumentacja Recharts
 * @see {@link ../data/PasswordContext.tsx} - Kontekst haseł
 * @see {ChartData} - Struktura danych wykresu
 * @see {chartConfig} - Konfiguracja wykresu
 */
export function Chart() {
  const { state, getUserLogins } = usePasswordContext();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  const days = [
    "Poniedzialek",
    "Wtorek",
    "Sroda",
    "Czwartek",
    "Piatek",
    "Sobota",
    "Niedziela",
  ];

  /**
   * Przetwarza dane logowań na dane wykresu.
   * @function processLoginData
   * @param {Array<{timestamp: string}>} logins - Lista logowań zawierająca timestampy w formacie ISO.
   * @returns {ChartData[]} Tablica obiektów z danymi wykresu (dzień tygodnia i liczba logowań).
   */
  const processLoginData = (logins: { timestamp: string }[]): ChartData[] => {
    const daysOfWeek = days;
    const loginCounts = new Array(7).fill(0);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    logins.forEach((entry) => {
      const date = new Date(entry.timestamp);
      if (date >= oneWeekAgo) {
        const dayIndex = date.getDay();
        loginCounts[(dayIndex + 6) % 7] += 1;
      }
    });

    return daysOfWeek.map((day, index) => ({
      month: day,
      logins: loginCounts[index],
    }));
  };

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
          console.log("Użyto danych z pamięci podręcznej w stanie kontekstu.");
        } else {
          const logins = await getUserLogins(userId);
          const processedData = processLoginData(logins);
          setChartData(processedData);
          toast.success("Pobrano dane logowań!");
        }
        setHasFetched(true);
      } catch (error) {
        console.error("Błąd pobierania danych:", error);
        toast.error("Nie udało się pobrać danych logowań.");
        setChartData([]);
        setHasFetched(true);
      }
    };

    fetchLogins();
  }, [state.currentUser?.id, state.token, hasFetched, getUserLogins]);

  if (!state.currentUser) {
    return (
      <div className="text-center text-gray-500">
        Zaloguj się, aby zobaczyć wykres.
      </div>
    );
  }

  if (!hasFetched) {
    return <div className="text-center text-gray-500">Ładowanie...</div>;
  }

  return (
    <ChartContainer config={chartConfig} className="select-none">
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{
          top: 20,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Bar
          dataKey="logins"
          fill="var(--color-desktop)"
          radius={8}
          isAnimationActive={false}
        >
          <LabelList
            position="top"
            offset={12}
            className="fill-foreground"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}