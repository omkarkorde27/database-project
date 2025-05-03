"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FoodWasteData } from "@/lib/data/types";
import { useEffect, useState } from "react";
import { FiBarChart2, FiCoffee, FiHome, FiShoppingBag } from "react-icons/fi";

type WasteType = "combined" | "household" | "retail" | "foodService";

interface WasteTypeFilterProps {
  data: FoodWasteData[];
  onFilterChange: (wasteType: WasteType) => void;
}

export function WasteTypeFilter({
  data,
  onFilterChange,
}: WasteTypeFilterProps) {
  const [activeType, setActiveType] = useState<WasteType>("combined");
  const [typeAverages, setTypeAverages] = useState<{
    [key in WasteType]: number;
  }>({
    combined: 0,
    household: 0,
    retail: 0,
    foodService: 0,
  });

  useEffect(() => {
    if (data.length === 0) return;

    // Calculate averages for each waste type
    const combinedSum = data.reduce(
      (sum, item) => sum + item.combinedFigures,
      0,
    );
    const householdSum = data.reduce(
      (sum, item) => sum + item.householdEstimatePerCapita,
      0,
    );
    const retailSum = data.reduce(
      (sum, item) => sum + item.retailEstimatePerCapita,
      0,
    );
    const foodServiceSum = data.reduce(
      (sum, item) => sum + item.foodServiceEstimatePerCapita,
      0,
    );

    setTypeAverages({
      combined: combinedSum / data.length,
      household: householdSum / data.length,
      retail: retailSum / data.length,
      foodService: foodServiceSum / data.length,
    });
  }, [data]);

  const handleTypeChange = (value: string) => {
    const wasteType = value as WasteType;
    setActiveType(wasteType);
    onFilterChange(wasteType);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FiBarChart2 className="text-[#1e88e5] dark:text-sky-400" />
          Waste Type Filter
        </CardTitle>
        <CardDescription>Filter data by type of food waste</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <Tabs
          value={activeType}
          onValueChange={handleTypeChange}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger
              value="combined"
              className="text-xs py-1 flex flex-col items-center gap-1"
            >
              <FiBarChart2 size={16} />
              <span>All</span>
            </TabsTrigger>
            <TabsTrigger
              value="household"
              className="text-xs py-1 flex flex-col items-center gap-1"
            >
              <FiHome size={16} />
              <span>Household</span>
            </TabsTrigger>
            <TabsTrigger
              value="retail"
              className="text-xs py-1 flex flex-col items-center gap-1"
            >
              <FiShoppingBag size={16} />
              <span>Retail</span>
            </TabsTrigger>
            <TabsTrigger
              value="foodService"
              className="text-xs py-1 flex flex-col items-center gap-1"
            >
              <FiCoffee size={16} />
              <span>Food Service</span>
            </TabsTrigger>
          </TabsList>

          <div className="text-xs text-muted-foreground mt-2">
            <div className="flex justify-between mb-1">
              <span>Average in dataset:</span>
              <span className="font-medium">
                {typeAverages[activeType].toFixed(1)} kg/capita/year
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${Math.min((typeAverages[activeType] / 100) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-4 text-xs text-center text-muted-foreground">
            {activeType === "combined" &&
              "Showing all combined food waste figures"}
            {activeType === "household" &&
              "Household waste is from residential sources"}
            {activeType === "retail" &&
              "Retail waste occurs in supermarkets and stores"}
            {activeType === "foodService" &&
              "Food service waste is from restaurants and catering"}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
