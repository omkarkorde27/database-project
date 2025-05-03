"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllCountries, getComparisonData } from "@/lib/data/dataService";
import type { FoodWasteData } from "@/lib/data/types";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

// Dynamically import Chart.js components
const Bar = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), {
  ssr: false,
});

// Initialize chart.js on client side
const initChartJS = async () => {
  const { Chart } = await import("chart.js/auto");
  const { CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } =
    await import("chart.js");

  Chart.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  );
};

interface CountryComparisonProps {
  data: FoodWasteData[];
}

export function CountryComparison({ data }: CountryComparisonProps) {
  const allCountries = getAllCountries(data);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([
    "United States of America",
    "China",
    "India",
    "United Kingdom",
    "Germany",
  ]);
  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    initChartJS().then(() => setIsChartReady(true));
  }, []);

  const comparisonData = getComparisonData(data, selectedCountries);

  const chartData = {
    labels: comparisonData.map((item) => item.country),
    datasets: [
      {
        label: "Household",
        data: comparisonData.map(
          (item) => item.combinedFigures * item.wasteSources.household,
        ),
        backgroundColor: "rgba(34, 197, 94, 0.6)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 1,
      },
      {
        label: "Retail",
        data: comparisonData.map(
          (item) => item.combinedFigures * item.wasteSources.retail,
        ),
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
      {
        label: "Food Service",
        data: comparisonData.map(
          (item) => item.combinedFigures * item.wasteSources.foodService,
        ),
        backgroundColor: "rgba(249, 115, 22, 0.6)",
        borderColor: "rgb(249, 115, 22)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Food Waste Source Comparison",
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: "kg/capita/year",
        },
      },
    },
  };

  const handleAddCountry = (country: string) => {
    if (selectedCountries.includes(country)) return;

    if (selectedCountries.length >= 8) {
      // Limit to 8 countries to keep the chart readable
      alert(
        "Please remove a country before adding a new one. Maximum 8 countries for comparison.",
      );
      return;
    }

    setSelectedCountries([...selectedCountries, country]);
  };

  const handleRemoveCountry = (country: string) => {
    setSelectedCountries(selectedCountries.filter((c) => c !== country));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Country Comparison</CardTitle>
        <CardDescription>
          Compare food waste distribution between countries
        </CardDescription>
        <div className="flex flex-wrap gap-2 mt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Add Country</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
              {allCountries
                .filter((country) => !selectedCountries.includes(country))
                .map((country) => (
                  <DropdownMenuItem
                    key={country}
                    onClick={() => handleAddCountry(country)}
                  >
                    {country}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedCountries.map((country) => (
            <Button
              key={country}
              variant="secondary"
              size="sm"
              onClick={() => handleRemoveCountry(country)}
              className="gap-1"
            >
              {country}
              <span className="ml-1">&times;</span>
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="h-[400px]">
        {isChartReady ? (
          <Bar options={chartOptions} data={chartData} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
