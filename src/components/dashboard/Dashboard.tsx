"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  fetchFoodWasteData,
  filterData,
  getAllCountries,
  getAllRegions,
} from "@/lib/data/dataService";
import type { FilterOptions, FoodWasteData } from "@/lib/data/types";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChatBot } from "./ChatBot";
import { CountryComparison } from "./CountryComparison";
import { CountrySearch } from "./CountrySearch";
import { DataCharts } from "./DataCharts";
import { DataOverview } from "./DataOverview";
import { DataTable } from "./DataTable";
import { ExportOptions } from "./ExportOptions";
import { RegionFilter } from "./RegionFilter";
import { SpeechNavigation } from "./SpeechNavigation";
import { TrendAnalysis } from "./TrendAnalysis";
import { WasteRangeFilter } from "./WasteRangeFilter";
import { WasteTypeFilter } from "./WasteTypeFilter";

// Add waste type type definition
type WasteType = "combined" | "household" | "retail" | "foodService";

export function Dashboard() {
  const [data, setData] = useState<FoodWasteData[]>([]);
  const [filteredData, setFilteredData] = useState<FoodWasteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [activeWasteType, setActiveWasteType] = useState<WasteType>("combined");
  const [wasteTypeData, setWasteTypeData] = useState<FoodWasteData[]>([]);

  const tableRef = useRef<HTMLDivElement>(null);
  const trendRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const insightsRef = useRef<HTMLDivElement>(null);
  const { toast: uiToast } = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        const foodWasteData = await fetchFoodWasteData();
        setData(foodWasteData);
        setFilteredData(foodWasteData);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load food waste data. Please try again later.");
        setIsLoading(false);
        console.error(err);
      }
    }

    loadData();
  }, []);

  // Handle waste type filtering
  useEffect(() => {
    if (data.length === 0) return;

    // Create a copy of the data and update values based on selected waste type
    const mappedData = data.map((item) => {
      const copy = { ...item };

      if (activeWasteType === "household") {
        copy.combinedFigures = item.householdEstimatePerCapita;
      } else if (activeWasteType === "retail") {
        copy.combinedFigures = item.retailEstimatePerCapita;
      } else if (activeWasteType === "foodService") {
        copy.combinedFigures = item.foodServiceEstimatePerCapita;
      }
      // If 'combined', keep the original combinedFigures

      return copy;
    });

    setWasteTypeData(mappedData);
  }, [data, activeWasteType]);

  useEffect(() => {
    const dataToFilter = activeWasteType === "combined" ? data : wasteTypeData;
    setFilteredData(filterData(dataToFilter, filterOptions));
  }, [data, wasteTypeData, filterOptions, activeWasteType]);

  const handleRegionFilterChange = (region: string | null) => {
    setFilterOptions((prev) => ({
      ...prev,
      region: region || undefined,
    }));
  };

  const handleWasteRangeFilterChange = (min: number, max: number) => {
    setFilterOptions((prev) => ({
      ...prev,
      minWaste: min,
      maxWaste: max,
    }));
  };

  const handleWasteTypeFilterChange = (wasteType: WasteType) => {
    setActiveWasteType(wasteType);

    // Show toast notification about the filter change
    const wasteTypeLabels = {
      combined: "Combined",
      household: "Household",
      retail: "Retail",
      foodService: "Food Service",
    };

    toast.info(`Showing ${wasteTypeLabels[wasteType]} waste data`, {
      description: `Data filtered to show ${wasteTypeLabels[wasteType].toLowerCase()} food waste figures.`,
      duration: 3000,
    });
  };

  const handleSelectCountry = (country: string) => {
    setSelectedCountry(country);

    // Scroll to the data table
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: "smooth" });
      setActiveTab("table");
    }, 100);

    // Show a toast notification
    uiToast({
      title: `${country} selected`,
      description: "Scroll down to see detailed data for this country.",
    });
  };

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);

    // Scroll to the appropriate section
    setTimeout(() => {
      switch (tab) {
        case "trends":
          trendRef.current?.scrollIntoView({ behavior: "smooth" });
          break;
        case "table":
          tableRef.current?.scrollIntoView({ behavior: "smooth" });
          break;
        case "export":
          exportRef.current?.scrollIntoView({ behavior: "smooth" });
          break;
        default:
          window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 100);
  };

  const handleExport = (type: "csv" | "pdf") => {
    exportRef.current?.scrollIntoView({ behavior: "smooth" });

    // Trigger the export through UI
    const exportButton = document.querySelector(
      type === "csv" ? "[data-export-csv]" : "[data-export-pdf]",
    ) as HTMLElement;

    if (exportButton) {
      exportButton.click();
    } else {
      uiToast({
        title: "Export Command Received",
        description: `Please use the export buttons to export as ${type.toUpperCase()}`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const allCountries = getAllCountries(data);
  const allRegions = getAllRegions(data);

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold text-[#1e88e5]">
          Global Food Waste Dashboard
        </h1>
        <p className="text-muted-foreground">
          Explore food waste data from countries around the world. The data is
          measured in kilograms per capita per year.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex justify-between items-center">
          <TabsList className="bg-[#e6f7ff] border border-blue-100">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[#1e88e5] data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="trends"
              className="data-[state=active]:bg-[#1e88e5] data-[state=active]:text-white"
            >
              Trends
            </TabsTrigger>
            <TabsTrigger
              value="compare"
              className="data-[state=active]:bg-[#1e88e5] data-[state=active]:text-white"
            >
              Compare
            </TabsTrigger>
            <TabsTrigger
              value="table"
              className="data-[state=active]:bg-[#1e88e5] data-[state=active]:text-white"
            >
              Data Table
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <DataOverview data={data} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <DataCharts
                data={filteredData.length > 0 ? filteredData : data}
              />
            </div>
            <div className="space-y-4">
              <SpeechNavigation
                onSelectTab={handleSelectTab}
                onSelectCountry={handleSelectCountry}
                onSelectRegion={handleRegionFilterChange}
                onExport={handleExport}
                availableCountries={allCountries}
                availableRegions={allRegions}
              />
              <CountrySearch
                data={data}
                onSelectCountry={handleSelectCountry}
              />
              <RegionFilter
                data={data}
                onFilterChange={handleRegionFilterChange}
              />
              <WasteTypeFilter
                data={data}
                onFilterChange={handleWasteTypeFilterChange}
              />
              <WasteRangeFilter
                data={data}
                onFilterChange={handleWasteRangeFilterChange}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div ref={trendRef}>
            <TrendAnalysis data={data} />
          </div>
        </TabsContent>

        <TabsContent value="compare" className="space-y-4">
          <CountryComparison data={data} />
          <div ref={exportRef} className="max-w-md mx-auto">
            <ExportOptions data={data} filteredData={filteredData} />
          </div>
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <div ref={tableRef}>
            <h2 className="text-xl font-bold mb-4 text-[#1e88e5]">
              Detailed Data Table
            </h2>
            <DataTable
              data={filteredData.length > 0 ? filteredData : data}
              highlightedCountry={selectedCountry}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* ChatBot */}
      <ChatBot
        data={data}
        onSelectCountry={handleSelectCountry}
        onSelectRegion={handleRegionFilterChange}
        onSelectTab={handleSelectTab}
        onSelectWasteType={handleWasteTypeFilterChange}
      />
    </div>
  );
}
