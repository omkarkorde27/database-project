import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRegionData, getTopWasteCountries } from "@/lib/data/dataService";
import type { FoodWasteData } from "@/lib/data/types";

interface DataOverviewProps {
  data: FoodWasteData[];
}

export function DataOverview({ data }: DataOverviewProps) {
  const topCountries = getTopWasteCountries(data, 5);
  const regionData = getRegionData(data);

  // Calculate global statistics
  const totalCountries = data.length;
  const averageWaste =
    data.reduce((sum, item) => sum + item.combinedFigures, 0) / totalCountries;
  const highestWasteCountry = topCountries[0]?.country || "N/A";
  const highestWasteAmount = topCountries[0]?.combinedFigures || 0;
  const highestWasteRegion = regionData[0]?.region || "N/A";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Countries Analyzed
          </CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" />
            <path d="M7 21a9 9 0 0 0 10 0" />
            <path d="M21 12a9 9 0 0 0-9-9 9 9 0 0 0-9 9" />
            <path d="M7 3a9 9 0 0 0 0 10" />
            <path d="M16 3a9 9 0 0 1 1 10" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCountries}</div>
          <p className="text-xs text-muted-foreground">
            Countries with food waste data
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Average Food Waste
          </CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <path d="M2 10h20" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageWaste.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">
            kg/capita/year globally
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Highest Waste Country
          </CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="m8 14-6-6 6-6" />
            <path d="M18 2v20" />
            <path d="M2 8h16" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{highestWasteCountry}</div>
          <p className="text-xs text-muted-foreground">
            {highestWasteAmount.toFixed(1)} kg/capita/year
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Highest Waste Region
          </CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{highestWasteRegion}</div>
          <p className="text-xs text-muted-foreground">
            Highest average food waste
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
