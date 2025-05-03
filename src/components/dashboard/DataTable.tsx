import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FoodWasteData } from "@/lib/data/types";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface DataTableProps {
  data: FoodWasteData[];
  highlightedCountry?: string | null;
}

export function DataTable({ data, highlightedCountry }: DataTableProps) {
  const [sortBy, setSortBy] = useState<keyof FoodWasteData>("combinedFigures");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const highlightedRowRef = useState<HTMLTableRowElement | null>(null);

  // Sort and filter data
  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  const filteredData = sortedData.filter((item) =>
    item.country.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Reset to page 1 when highlighted country changes
  useEffect(() => {
    if (highlightedCountry) {
      // Find the index of the highlighted country in the filtered data
      const index = filteredData.findIndex(
        (item) => item.country === highlightedCountry,
      );
      if (index !== -1) {
        // Calculate which page the country is on
        const page = Math.floor(index / itemsPerPage) + 1;
        setCurrentPage(page);
        setSearchTerm(""); // Clear any existing search
      }
    }
  }, [highlightedCountry, filteredData, itemsPerPage]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleSort = (column: keyof FoodWasteData) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  const sortIndicator = (column: keyof FoodWasteData) => {
    if (sortBy !== column) return null;
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by country..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
          className="max-w-sm"
        />
      </div>

      <Table className="border">
        <TableCaption>Food waste data by country (kg/capita/year)</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleSort("country")}
            >
              Country {sortIndicator("country")}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted text-right"
              onClick={() => handleSort("combinedFigures")}
            >
              Combined Figures {sortIndicator("combinedFigures")}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted text-right"
              onClick={() => handleSort("householdEstimatePerCapita")}
            >
              Household {sortIndicator("householdEstimatePerCapita")}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted text-right"
              onClick={() => handleSort("retailEstimatePerCapita")}
            >
              Retail {sortIndicator("retailEstimatePerCapita")}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted text-right"
              onClick={() => handleSort("foodServiceEstimatePerCapita")}
            >
              Food Service {sortIndicator("foodServiceEstimatePerCapita")}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleSort("region")}
            >
              Region {sortIndicator("region")}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleSort("confidenceInEstimate")}
            >
              Confidence {sortIndicator("confidenceInEstimate")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((item) => (
            <TableRow
              key={item.country}
              className={
                highlightedCountry === item.country
                  ? "bg-primary/10 border-l-4 border-primary"
                  : ""
              }
              ref={
                highlightedCountry === item.country
                  ? (el) => highlightedRowRef[1](el)
                  : undefined
              }
            >
              <TableCell className="font-medium">{item.country}</TableCell>
              <TableCell className="text-right">
                {item.combinedFigures}
              </TableCell>
              <TableCell className="text-right">
                {item.householdEstimatePerCapita}
              </TableCell>
              <TableCell className="text-right">
                {item.retailEstimatePerCapita}
              </TableCell>
              <TableCell className="text-right">
                {item.foodServiceEstimatePerCapita}
              </TableCell>
              <TableCell>{item.region}</TableCell>
              <TableCell>{item.confidenceInEstimate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-
            {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
            {filteredData.length} countries
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
