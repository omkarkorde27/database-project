"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAllCountries } from "@/lib/data/dataService";
import type { FoodWasteData } from "@/lib/data/types";
import { useEffect, useState } from "react";

interface CountrySearchProps {
  data: FoodWasteData[];
  onSelectCountry: (country: string) => void;
}

export function CountrySearch({ data, onSelectCountry }: CountrySearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const allCountries = getAllCountries(data);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    const lowerCaseSearch = searchTerm.toLowerCase();
    const results = allCountries.filter((country) =>
      country.toLowerCase().includes(lowerCaseSearch),
    );

    setSearchResults(results);
  }, [searchTerm, allCountries]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Already handled by the useEffect
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Countries</CardTitle>
        <CardDescription>
          Find specific countries in the dataset
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Type a country name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              className="bg-[#1e88e5] hover:bg-[#1976d2] text-white"
              disabled={!searchTerm.trim()}
            >
              Search
            </Button>
          </div>

          {searchResults.length > 0 && (
            <ScrollArea className="h-[200px] rounded-md border p-2">
              <div className="space-y-1">
                {searchResults.map((country) => (
                  <Button
                    key={country}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      onSelectCountry(country);
                      setSearchTerm("");
                    }}
                  >
                    {country}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
