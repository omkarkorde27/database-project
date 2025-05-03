"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import type { FoodWasteData } from "@/lib/data/types";
import { useEffect, useState } from "react";

interface WasteRangeFilterProps {
  data: FoodWasteData[];
  onFilterChange: (min: number, max: number) => void;
}

export function WasteRangeFilter({
  data,
  onFilterChange,
}: WasteRangeFilterProps) {
  // Find the min and max values in the data
  const minWaste = Math.floor(
    Math.min(...data.map((item) => item.combinedFigures)),
  );
  const maxWaste = Math.ceil(
    Math.max(...data.map((item) => item.combinedFigures)),
  );

  const [range, setRange] = useState<[number, number]>([minWaste, maxWaste]);

  useEffect(() => {
    // Update the range if the data changes
    setRange([minWaste, maxWaste]);
  }, [data, minWaste, maxWaste]);

  const handleSliderChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    setRange(newRange);
    onFilterChange(newRange[0], newRange[1]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter by Waste Amount</CardTitle>
        <CardDescription>
          Adjust the range to filter countries by food waste amount
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Slider
            defaultValue={[minWaste, maxWaste]}
            value={range}
            min={minWaste}
            max={maxWaste}
            step={1}
            onValueChange={handleSliderChange}
            className="pt-5 bg-blue-100"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {range[0]} kg/capita/year
            </span>
            <span className="text-sm font-medium">
              {range[1]} kg/capita/year
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
