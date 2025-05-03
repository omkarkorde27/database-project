"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllRegions } from "@/lib/data/dataService";
import type { FoodWasteData } from "@/lib/data/types";
import { useState } from "react";

interface RegionFilterProps {
  data: FoodWasteData[];
  onFilterChange: (region: string | null) => void;
}

export function RegionFilter({ data, onFilterChange }: RegionFilterProps) {
  const regions = getAllRegions(data);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const handleRegionClick = (region: string | null) => {
    if (selectedRegion === region) {
      setSelectedRegion(null);
      onFilterChange(null);
    } else {
      setSelectedRegion(region);
      onFilterChange(region);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter by Region</CardTitle>
        <CardDescription>
          Select a region to filter the data or show all
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button
            key="all"
            onClick={() => handleRegionClick(null)}
            variant={selectedRegion === null ? "default" : "outline"}
            className={
              selectedRegion === null ? "bg-[#1e88e5] hover:bg-[#1976d2]" : ""
            }
            size="sm"
          >
            All Regions
          </Button>

          {regions.map((region) => (
            <Button
              key={region}
              variant={selectedRegion === region ? "default" : "outline"}
              size="sm"
              onClick={() => handleRegionClick(region)}
            >
              {region}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
