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
  const [isLoading, setIsLoading] = useState(true);

  const processLoginData = (logins: { timestamp: string }[]): ChartData[] => {
    const daysOfWeek = [
      "Poniedzialek",
      "Wtorek",
      "Sroda",
      "Czwartek",
      "Piatek",
      "Sobota",
      "Niedziela",
    ];
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
      if (!state.currentUser || !state.token) {
        setChartData([]); 
        setIsLoading(false);
        return;
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
      } catch (error) {
        console.error("Błąd pobierania danych:", error);
        toast.error("Nie udało się pobrać danych logowań.");
        setChartData([]); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogins();
  }, [state.currentUser, state.token, state.userLogins, getUserLogins]); 

  if (isLoading) {
    return <div className="text-center text-gray-500">Ładowanie...</div>;
  }

  return (
    <ChartContainer config={chartConfig}>
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