"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getRegionData,
  getTopWasteCountries,
  getWasteDistribution,
} from "@/lib/data/dataService";
import type { FoodWasteData } from "@/lib/data/types";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import Chart.js components
const Bar = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), {
  ssr: false,
});

const Pie = dynamic(() => import("react-chartjs-2").then((mod) => mod.Pie), {
  ssr: false,
});

// Import and register chart.js components on the client side
const initChartJS = async () => {
  const { Chart } = await import("chart.js/auto");
  const {
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Colors,
    PointElement,
    LineElement,
  } = await import("chart.js");

  Chart.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Colors,
    PointElement,
    LineElement,
  );
};

interface DataChartsProps {
  data: FoodWasteData[];
}

export function DataCharts({ data }: DataChartsProps) {
  const [activeTab, setActiveTab] = useState("top-countries");
  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    initChartJS().then(() => setIsChartReady(true));
  }, []);

  if (!isChartReady) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Chart for top 10 countries by combined waste
  const topCountries = getTopWasteCountries(data, 10);
  const topCountriesChartData = {
    labels: topCountries.map((item) => item.country),
    datasets: [
      {
        label: "Food Waste (kg/capita/year)",
        data: topCountries.map((item) => item.combinedFigures),
        backgroundColor: "rgba(34, 197, 94, 0.6)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 1,
      },
    ],
  };

  // Chart for regional comparison
  const regionData = getRegionData(data);
  const regionsChartData = {
    labels: regionData.map((item) => item.region),
    datasets: [
      {
        label: "Average Food Waste (kg/capita/year)",
        data: regionData.map((item) => item.averageCombinedFigures),
        backgroundColor: "rgba(34, 197, 94, 0.6)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 1,
      },
    ],
  };

  // Chart for waste source distribution
  const globalHousehold =
    data.reduce((acc, item) => acc + item.householdEstimatePerCapita, 0) /
    data.length;
  const globalRetail =
    data.reduce((acc, item) => acc + item.retailEstimatePerCapita, 0) /
    data.length;
  const globalFoodService =
    data.reduce((acc, item) => acc + item.foodServiceEstimatePerCapita, 0) /
    data.length;

  const distributionChartData = {
    labels: ["Household", "Retail", "Food Service"],
    datasets: [
      {
        data: [globalHousehold, globalRetail, globalFoodService],
        backgroundColor: [
          "rgba(34, 197, 94, 0.6)",
          "rgba(59, 130, 246, 0.6)",
          "rgba(249, 115, 22, 0.6)",
        ],
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(59, 130, 246)",
          "rgb(249, 115, 22)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart for confidence levels
  const confidenceLevels = [
    "Very Low Confidence",
    "Low Confidence",
    "Medium Confidence",
    "High Confidence",
  ];
  const confidenceCounts = confidenceLevels.map(
    (level) =>
      data.filter((item) => item.confidenceInEstimate === level).length,
  );

  const confidenceChartData = {
    labels: confidenceLevels,
    datasets: [
      {
        data: confidenceCounts,
        backgroundColor: [
          "rgba(239, 68, 68, 0.6)",
          "rgba(249, 115, 22, 0.6)",
          "rgba(234, 179, 8, 0.6)",
          "rgba(34, 197, 94, 0.6)",
        ],
        borderColor: [
          "rgb(239, 68, 68)",
          "rgb(249, 115, 22)",
          "rgb(234, 179, 8)",
          "rgb(34, 197, 94)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Food Waste Comparison",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "kg/capita/year",
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Distribution",
      },
    },
  };

  return (
    <Tabs
      defaultValue="top-countries"
      className="space-y-4"
      onValueChange={setActiveTab}
    >
      <TabsList className="grid grid-cols-4">
        <TabsTrigger value="top-countries">Top Countries</TabsTrigger>
        <TabsTrigger value="regions">Regional Comparison</TabsTrigger>
        <TabsTrigger value="distribution">Waste Sources</TabsTrigger>
        <TabsTrigger value="confidence">Data Quality</TabsTrigger>
      </TabsList>

      <TabsContent value="top-countries" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Countries with Highest Food Waste</CardTitle>
            <CardDescription>
              Food waste measured in kg per capita per year
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <Bar options={barOptions} data={topCountriesChartData} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="regions" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Food Waste by Region</CardTitle>
            <CardDescription>
              Average food waste per region (kg/capita/year)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <Bar options={barOptions} data={regionsChartData} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="distribution" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Global Food Waste Sources</CardTitle>
            <CardDescription>
              Distribution of food waste between household, retail, and food
              service
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] flex justify-center">
            <div className="w-[400px]">
              <Pie options={pieOptions} data={distributionChartData} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="confidence" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Data Confidence Levels</CardTitle>
            <CardDescription>
              Quality of the food waste data across countries
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] flex justify-center">
            <div className="w-[400px]">
              <Pie options={pieOptions} data={confidenceChartData} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
