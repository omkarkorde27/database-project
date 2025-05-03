"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllCountries, getAllRegions } from "@/lib/data/dataService";
import {
  CountryTrendData,
  generateTrendData,
  getCountryTrendData,
  getGlobalTrendData,
  getRegionalTrendData,
} from "@/lib/data/trendData";
import type { FoodWasteData } from "@/lib/data/types";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

// Dynamically import Chart.js components
const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), {
  ssr: false,
});

// Initialize chart.js on client side
const initChartJS = async () => {
  const { Chart } = await import("chart.js/auto");
  const {
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } = await import("chart.js");

  Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  );
};

interface TrendAnalysisProps {
  data: FoodWasteData[];
}

// Define a type for the tooltip callback context
interface TooltipCallbackContext {
  dataset: {
    label: string;
  };
  parsed: {
    y: number;
  };
}

export function TrendAnalysis({ data }: TrendAnalysisProps) {
  const [isChartReady, setIsChartReady] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([
    "United States of America",
    "China",
    "India",
  ]);
  const [selectedView, setSelectedView] = useState<"combined" | "breakdown">(
    "combined",
  );
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("countries");

  // Memoize the trend data to prevent recalculations on each render
  const trendData = useMemo(() => generateTrendData(data), [data]);

  // Memoize derived data
  const allCountries = useMemo(() => getAllCountries(data), [data]);
  const allRegions = useMemo(() => getAllRegions(data), [data]);

  // Initialize Chart.js once
  useEffect(() => {
    let isMounted = true;
    initChartJS().then(() => {
      if (isMounted) {
        setIsChartReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Memoize chart datasets to prevent unnecessary recalculations
  const countryComparisonData = useMemo(() => {
    const selectedCountryData = getCountryTrendData(
      trendData,
      selectedCountries,
    );

    return {
      labels:
        trendData.length > 0 ? trendData[0].trendData.map((d) => d.year) : [],
      datasets: selectedCountryData.map((country, index) => {
        // Create a predictable color based on index
        const colors = [
          "rgb(34, 197, 94)", // green
          "rgb(59, 130, 246)", // blue
          "rgb(249, 115, 22)", // orange
          "rgb(239, 68, 68)", // red
          "rgb(139, 92, 246)", // purple
          "rgb(234, 179, 8)", // yellow
        ];

        const colorIndex = index % colors.length;

        return {
          label: country.country,
          data: country.trendData.map((d) =>
            selectedView === "combined"
              ? d.combinedFigures
              : d.householdEstimatePerCapita +
                d.retailEstimatePerCapita +
                d.foodServiceEstimatePerCapita,
          ),
          borderColor: colors[colorIndex],
          backgroundColor: colors[colorIndex]
            .replace("rgb", "rgba")
            .replace(")", ", 0.2)"),
          tension: 0.3,
        };
      }),
    };
  }, [trendData, selectedCountries, selectedView]);

  // Memoize waste source data
  const wasteSourceData = useMemo(() => {
    const selectedCountryData =
      selectedCountries.length > 0
        ? getCountryTrendData(trendData, [selectedCountries[0]])[0]
        : null;

    return {
      labels: selectedCountryData
        ? selectedCountryData.trendData.map((d) => d.year)
        : [],
      datasets: [
        {
          label: "Household",
          data: selectedCountryData
            ? selectedCountryData.trendData.map(
                (d) => d.householdEstimatePerCapita,
              )
            : [],
          borderColor: "rgb(34, 197, 94)", // green
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          tension: 0.3,
        },
        {
          label: "Retail",
          data: selectedCountryData
            ? selectedCountryData.trendData.map(
                (d) => d.retailEstimatePerCapita,
              )
            : [],
          borderColor: "rgb(59, 130, 246)", // blue
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          tension: 0.3,
        },
        {
          label: "Food Service",
          data: selectedCountryData
            ? selectedCountryData.trendData.map(
                (d) => d.foodServiceEstimatePerCapita,
              )
            : [],
          borderColor: "rgb(249, 115, 22)", // orange
          backgroundColor: "rgba(249, 115, 22, 0.2)",
          tension: 0.3,
        },
      ],
    };
  }, [trendData, selectedCountries]);

  // Memoize regional comparison data
  const regionalComparisonData = useMemo(() => {
    const globalTrendData = getGlobalTrendData(trendData);
    const regionalTrendData = selectedRegion
      ? getRegionalTrendData(trendData, selectedRegion)
      : null;

    return {
      labels: globalTrendData.map((d) => d.year),
      datasets: [
        {
          label: "Global Average",
          data: globalTrendData.map((d) => d.combinedFigures),
          borderColor: "rgb(107, 114, 128)", // gray
          backgroundColor: "rgba(107, 114, 128, 0.2)",
          tension: 0.3,
        },
        ...(regionalTrendData
          ? [
              {
                label: `${selectedRegion} Average`,
                data: regionalTrendData.map((d) => d.combinedFigures),
                borderColor: "rgb(34, 197, 94)", // green
                backgroundColor: "rgba(34, 197, 94, 0.2)",
                tension: 0.3,
              },
            ]
          : []),
      ],
    };
  }, [trendData, selectedRegion]);

  // Memoize chart options
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top" as const,
        },
        title: {
          display: true,
          text: "Food Waste Trends Over Time",
        },
        tooltip: {
          callbacks: {
            label: (context: TooltipCallbackContext) =>
              `${context.dataset.label}: ${context.parsed.y} kg/capita/year`,
          },
        },
      },
      scales: {
        y: {
          title: {
            display: true,
            text: "Food Waste (kg/capita/year)",
          },
          beginAtZero: false,
        },
      },
    }),
    [],
  );

  const handleAddCountry = (country: string) => {
    if (selectedCountries.includes(country)) return;

    if (selectedCountries.length >= 6) {
      alert(
        "Please remove a country before adding a new one. Maximum 6 countries for comparison.",
      );
      return;
    }

    setSelectedCountries([...selectedCountries, country]);
  };

  const handleRemoveCountry = (country: string) => {
    setSelectedCountries(selectedCountries.filter((c) => c !== country));
  };

  const handleSelectRegion = (region: string) => {
    setSelectedRegion(selectedRegion === region ? null : region);
  };

  if (!isChartReady) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Trend Analysis (2020-2025)</CardTitle>
        <CardDescription>
          Analyze food waste trends over time (Note: Historical data is
          simulated for demonstration)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="countries"
          className="space-y-4"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="countries">Country Comparison</TabsTrigger>
            <TabsTrigger value="sources">Waste Sources</TabsTrigger>
            <TabsTrigger value="regions">Regional Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="countries" className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
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

              <div className="flex gap-1 flex-wrap">
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

              <div className="ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSelectedView(
                      selectedView === "combined" ? "breakdown" : "combined",
                    )
                  }
                >
                  {selectedView === "combined"
                    ? "Show Total Waste"
                    : "Show Combined Figure"}
                </Button>
              </div>
            </div>

            <div className="h-[400px]">
              <Line data={countryComparisonData} options={chartOptions} />
            </div>
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Select Country</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
                  {allCountries.map((country) => (
                    <DropdownMenuItem
                      key={country}
                      onClick={() => setSelectedCountries([country])}
                    >
                      {country}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {selectedCountries.length > 0 && (
                <p className="ml-2 font-medium py-2">
                  Showing waste sources for: {selectedCountries[0]}
                </p>
              )}
            </div>

            <div className="h-[400px]">
              <Line data={wasteSourceData} options={chartOptions} />
            </div>
          </TabsContent>

          <TabsContent value="regions" className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={selectedRegion === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRegion(null)}
              >
                Global Only
              </Button>

              {allRegions.map((region) => (
                <Button
                  key={region}
                  variant={selectedRegion === region ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSelectRegion(region)}
                >
                  {region}
                </Button>
              ))}
            </div>

            <div className="h-[400px]">
              <Line data={regionalComparisonData} options={chartOptions} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
