import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartData } from "@/lib/interfaces";
import { User } from "@/data/PasswordContext";

/**
 * Konfiguracja wykresu słupkowego dla logowań użytkownika.
 * @type {ChartConfig}
 * @property {Object} logins - Konfiguracja słupków reprezentujących logowania.
 * @property {string} logins.label - Etykieta dla słupków (np. "Logowania").
 * @property {string} logins.color - Kolor słupków w formacie HSL (np. "hsl(var(--chart-1))").
 */
export const chartConfig = {
  logins: {
    label: "Logowania",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

/**
 * Komponent wyświetlający wykres słupkowy liczby logowań użytkownika w podziale na dni tygodnia.
 * Wykorzystuje bibliotekę Recharts do renderowania wykresu oraz komponenty UI z `@/components/ui/chart`.
 * 
 * @function Chart
 * @param {Object} props - Właściwości komponentu.
 * @param {User[]|null} props.user - Obiekt użytkownika, określający, czy użytkownik jest zalogowany.
 * @param {ChartData[]} props.chartData - Dane do wykresu, zawierające informacje o logowaniach w poszczególnych dniach tygodnia.
 * @param {boolean} props.hasFetched - Flaga wskazująca, czy dane zostały pobrane.
 * @returns {JSX.Element} Wykres słupkowy z liczbą logowań lub komunikat o stanie (np. "Zaloguj się", "Ładowanie...").
 * 
 * @example
 * ```tsx
 * import { Chart } from '@/components/Chart';
 * 
 * const user = { first_name: "patryk", id: "67eb5b5d-4b18-482c-a338-f761e5086811", last_name: "zawadzki", login: "user123@gmail.com" };
 * const chartData = [
 *   { month: "Poniedziałek", logins: 5 },
 *   { month: "Wtorek", logins: 10 },
 * ];
 * const hasFetched = true;
 * 
 * <Chart user={user} chartData={chartData} hasFetched={hasFetched} />
 * ```
 * 
 * @remarks
 * - Komponent wymaga, aby `user` był obiektem (lub `null`), aby określić, czy wyświetlić wykres czy komunikat o logowaniu.
 * - `chartData` powinno być zgodne z interfejsem `ChartData` (np. `{ month: string, logins: number }`).
 * - Jeśli `hasFetched` jest `false`, wyświetlany jest komunikat "Ładowanie...".
 * 
 * @see {@link https://recharts.org} - Dokumentacja biblioteki Recharts.
 * @see {@link ChartData} - Definicja interfejsu `ChartData`.
 */
export function Chart({user, chartData, hasFetched}: {user: User | null, chartData: ChartData[], hasFetched: boolean}) {

  if (!user) {
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