"use client";

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

interface ChartData {
  month: string; // Dzień tygodnia
  logins: number; // Liczba logowań
}

const chartConfig = {
  logins: {
    label: "Logowania",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function Chart() {
  const { state, getUserLogins } = usePasswordContext();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [hasFetched, setHasFetched] = useState(false); // Flaga kontrolująca, czy dane zostały pobrane

  function rotateArray(arr : string[],shift : number) : string[] {
    const len = arr.length;
    const offset = shift % len;
    return [...arr.slice(0,offset),...arr.slice(offset) ]
  }
  const days = [
    "Poniedzialek",
    "Wtorek",
    "Sroda",
    "Czwartek",
    "Piatek",
    "Sobota",
    "Niedziela",
  ];
  const processLoginData = (logins: { timestamp: string }[]): ChartData[] => {
    const daysOfWeek = days;
    const loginCounts = new Array(7).fill(0);

    logins.forEach((entry) => {
      const date = new Date(entry.timestamp);
      const dayIndex = date.getDay();
      loginCounts[(dayIndex + 6) % 7] += 1; // Przesuwamy, aby Poniedziałek był 0
    });

    return daysOfWeek.map((day, index) => ({
      month: day,
      logins: loginCounts[index],
    }));
  };

  useEffect(() => {
    const fetchLogins = async () => {
      if (!state.currentUser?.id || !state.token || hasFetched) {
        return; // Nie pobieraj, jeśli już raz pobrano dane
      }

      try {
        const userId = state.currentUser.id;

        if (state.userLogins.length > 0 && state.userLogins.some((entry) => entry.user_id === userId)) {
          const processedData = processLoginData(state.userLogins);
          setChartData(processedData);
          console.log("Użyto danych z pamięci podręcznej w stanie kontekstu.");
        } else {
          const logins = await getUserLogins(userId);
          const processedData = processLoginData(logins);
          setChartData(processedData);
          toast.success("Pobrano dane logowań!");
        }
        setHasFetched(true); // Ustawiamy flagę po pobraniu danych
      } catch (error) {
        console.error("Błąd pobierania danych:", error);
        toast.error("Nie udało się pobrać danych logowań.");
        setChartData([]); // Ustawiamy pustą tablicę w przypadku błędu
        setHasFetched(true); // Ustawiamy flagę nawet w przypadku błędu
      }
    };

    fetchLogins();
  }, [state.currentUser?.id, state.token, hasFetched, getUserLogins]); // Zależności: ID użytkownika, token i flaga pobrania

  if (!state.currentUser) {
    return <div className="text-center text-gray-500">Zaloguj się, aby zobaczyć wykres.</div>;
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
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="logins" fill="var(--color-desktop)" radius={8}>
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