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
  filterData,
  getAllRegions,
  getTopWasteCountries,
} from "@/lib/data/dataService";
import type { FoodWasteData } from "@/lib/data/types";
import { useCallback, useEffect, useState } from "react";
import {
  FiAlertTriangle,
  FiArrowDownRight,
  FiArrowUpRight,
  FiBarChart2,
  FiInfo,
  FiMap,
  FiPieChart,
  FiRefreshCw,
  FiSearch,
  FiTrendingUp,
} from "react-icons/fi";

interface InsightsPanelProps {
  data: FoodWasteData[];
}

type Insight = {
  text: string;
  icon: React.ReactNode;
  type: "trend" | "comparison" | "alert" | "stat" | "country" | "regional";
  subtext?: string;
};

export function InsightsPanel({ data }: InsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [countrySpecificInsights, setCountrySpecificInsights] = useState<
    Insight[]
  >([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showCountryInsights, setShowCountryInsights] = useState(false);
  const [countriesForInsights, setCountriesForInsights] = useState<string[]>(
    [],
  );

  // Generate a random set of countries for insights
  const selectRandomCountries = useCallback(() => {
    if (data.length === 0) return;

    const allCountries = data.map((item) => item.country);
    const shuffled = [...allCountries].sort(() => 0.5 - Math.random());
    const selectedCountries = shuffled.slice(0, 3);
    setCountriesForInsights(selectedCountries);

    if (selectedCountries.length > 0) {
      setSelectedCountry(selectedCountries[0]);
      generateCountryInsights(selectedCountries[0]);
    }
  }, [data]);

  useEffect(() => {
    // Add animation delay for better UX
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      const generatedInsights = generateInsights(data);
      setInsights(generatedInsights);
      selectRandomCountries();
    }
  }, [data, selectRandomCountries]);

  const generateCountryInsights = (country: string) => {
    if (!country || data.length === 0) return;

    const countryData = data.find((item) => item.country === country);
    if (!countryData) return;

    const globalAverage =
      data.reduce((sum, item) => sum + item.combinedFigures, 0) / data.length;
    const householdGlobalAvg =
      data.reduce((sum, item) => sum + item.householdEstimatePerCapita, 0) /
      data.length;
    const retailGlobalAvg =
      data.reduce((sum, item) => sum + item.retailEstimatePerCapita, 0) /
      data.length;
    const foodServiceGlobalAvg =
      data.reduce((sum, item) => sum + item.foodServiceEstimatePerCapita, 0) /
      data.length;

    const countriesInRegion = data.filter(
      (item) => item.region === countryData.region,
    );
    const regionAverage =
      countriesInRegion.reduce((sum, item) => sum + item.combinedFigures, 0) /
      countriesInRegion.length;

    const insights: Insight[] = [];

    // Overall comparison with global average
    const percentDiff =
      ((countryData.combinedFigures - globalAverage) / globalAverage) * 100;
    insights.push({
      text: `${country}'s food waste is ${Math.abs(percentDiff).toFixed(1)}% ${percentDiff >= 0 ? "higher" : "lower"} than the global average.`,
      icon:
        percentDiff >= 0 ? (
          <FiArrowUpRight size={18} />
        ) : (
          <FiArrowDownRight size={18} />
        ),
      type: "country",
      subtext: `${countryData.combinedFigures.toFixed(1)} kg/capita vs global average of ${globalAverage.toFixed(1)} kg/capita`,
    });

    // Regional comparison
    const regionPercentDiff =
      ((countryData.combinedFigures - regionAverage) / regionAverage) * 100;
    insights.push({
      text: `Compared to other countries in ${countryData.region}, ${country} is ${Math.abs(regionPercentDiff).toFixed(1)}% ${regionPercentDiff >= 0 ? "higher" : "lower"}.`,
      icon: <FiMap size={18} />,
      type: "regional",
      subtext: `Regional average for ${countryData.region}: ${regionAverage.toFixed(1)} kg/capita`,
    });

    // Breakdown by waste source
    const highestSource = [
      {
        name: "Household",
        value: countryData.householdEstimatePerCapita,
        avg: householdGlobalAvg,
      },
      {
        name: "Retail",
        value: countryData.retailEstimatePerCapita,
        avg: retailGlobalAvg,
      },
      {
        name: "Food Service",
        value: countryData.foodServiceEstimatePerCapita,
        avg: foodServiceGlobalAvg,
      },
    ].sort((a, b) => b.value - a.value)[0];

    insights.push({
      text: `The largest source of food waste in ${country} is ${highestSource.name} at ${highestSource.value.toFixed(1)} kg/capita/year.`,
      icon: <FiPieChart size={18} />,
      type: "country",
      subtext: `This is ${((highestSource.value / highestSource.avg) * 100).toFixed(0)}% of the global average for ${highestSource.name.toLowerCase()} waste.`,
    });

    // Data confidence note
    insights.push({
      text: `Data quality for ${country} is rated as "${countryData.confidenceInEstimate}".`,
      icon: <FiInfo size={18} />,
      type: "alert",
      subtext:
        countryData.confidenceInEstimate === "High Confidence"
          ? "The estimates are considered reliable."
          : "Take this data with appropriate caution due to estimation uncertainties.",
    });

    // Find similar countries
    const similarCountries = data
      .filter(
        (item) =>
          item.country !== country &&
          Math.abs(item.combinedFigures - countryData.combinedFigures) < 5,
      )
      .sort(
        (a, b) =>
          Math.abs(a.combinedFigures - countryData.combinedFigures) -
          Math.abs(b.combinedFigures - countryData.combinedFigures),
      )
      .slice(0, 2);

    if (similarCountries.length > 0) {
      insights.push({
        text: `${country} has similar food waste levels to ${similarCountries.map((c) => c.country).join(" and ")}.`,
        icon: <FiBarChart2 size={18} />,
        type: "comparison",
        subtext: `These countries have waste within 5 kg/capita/year of ${country}.`,
      });
    }

    setCountrySpecificInsights(insights);
    setShowCountryInsights(true);
  };

  return (
    <div className="space-y-4">
      <Card
        className={`transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <FiInfo className="text-[#1e88e5] dark:text-sky-400" /> Key Global
            Insights
          </CardTitle>
          <CardDescription>
            Automatically generated insights from the food waste data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`flex gap-3 items-start pb-3 border-b last:border-b-0 last:pb-0 transition-all duration-300 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div
                  className={`
                  p-2 rounded-full mt-1
                  ${insight.type === "trend" ? "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200" : ""}
                  ${insight.type === "comparison" ? "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-200" : ""}
                  ${insight.type === "alert" ? "bg-amber-100 text-amber-600 dark:bg-amber-800 dark:text-amber-200" : ""}
                  ${insight.type === "stat" ? "bg-purple-100 text-purple-600 dark:bg-purple-800 dark:text-purple-200" : ""}
                `}
                >
                  {insight.icon}
                </div>
                <div>
                  <div className="text-sm font-medium">{insight.text}</div>
                  {insight.subtext && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {insight.subtext}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card
        className={`transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FiSearch className="text-[#1e88e5] dark:text-sky-400" />{" "}
              Country-Specific Insights
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={selectRandomCountries}
              className="h-8 gap-1"
            >
              <FiRefreshCw size={14} />
              <span className="text-xs">Refresh</span>
            </Button>
          </div>
          <CardDescription>
            Detailed analysis for specific countries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {countriesForInsights.map((country) => (
              <Button
                key={country}
                variant={selectedCountry === country ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedCountry(country);
                  generateCountryInsights(country);
                }}
                className="text-xs h-8"
              >
                {country}
              </Button>
            ))}
          </div>

          {showCountryInsights && (
            <div className="space-y-4 mt-4">
              {countrySpecificInsights.map((insight, index) => (
                <div
                  key={index}
                  className={`flex gap-3 items-start pb-3 border-b last:border-b-0 last:pb-0 transition-all duration-300 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div
                    className={`
                    p-2 rounded-full mt-1
                    ${insight.type === "country" ? "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200" : ""}
                    ${insight.type === "regional" ? "bg-cyan-100 text-cyan-600 dark:bg-cyan-800 dark:text-cyan-200" : ""}
                    ${insight.type === "comparison" ? "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-200" : ""}
                    ${insight.type === "alert" ? "bg-amber-100 text-amber-600 dark:bg-amber-800 dark:text-amber-200" : ""}
                  `}
                  >
                    {insight.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{insight.text}</div>
                    {insight.subtext && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {insight.subtext}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function generateInsights(data: FoodWasteData[]): Insight[] {
  const insights: Insight[] = [];
  const regions = getAllRegions(data);
  const topCountries = getTopWasteCountries(data, 5);
  const bottomCountries = [...data]
    .sort((a, b) => a.combinedFigures - b.combinedFigures)
    .slice(0, 5);

  // Top wasting country
  if (topCountries.length > 0) {
    const topCountry = topCountries[0];
    insights.push({
      text: `${topCountry.country} has the highest food waste at ${topCountry.combinedFigures} kg/capita/year.`,
      icon: <FiTrendingUp size={18} />,
      type: "trend",
      subtext: `That's ${(topCountry.combinedFigures / (data.reduce((sum, item) => sum + item.combinedFigures, 0) / data.length)).toFixed(1)}× the global average.`,
    });
  }

  // Country with lowest waste
  if (bottomCountries.length > 0) {
    const lowestCountry = bottomCountries[0];
    insights.push({
      text: `${lowestCountry.country} has the lowest food waste at ${lowestCountry.combinedFigures} kg/capita/year.`,
      icon: <FiArrowDownRight size={18} />,
      type: "trend",
      subtext: `That's only ${((lowestCountry.combinedFigures / (data.reduce((sum, item) => sum + item.combinedFigures, 0) / data.length)) * 100).toFixed(0)}% of the global average.`,
    });
  }

  // Region with highest average waste
  const regionAverages = regions
    .map((region) => {
      const countriesInRegion = filterData(data, { region });
      const average =
        countriesInRegion.reduce(
          (sum, country) => sum + country.combinedFigures,
          0,
        ) / countriesInRegion.length;
      return { region, average, count: countriesInRegion.length };
    })
    .sort((a, b) => b.average - a.average);

  if (regionAverages.length > 0) {
    const topRegion = regionAverages[0];
    insights.push({
      text: `${topRegion.region} has the highest average food waste at ${topRegion.average.toFixed(1)} kg/capita/year.`,
      icon: <FiBarChart2 size={18} />,
      type: "comparison",
      subtext: `Based on data from ${topRegion.count} countries in this region.`,
    });
  }

  // Region with lowest average waste
  if (regionAverages.length > 1) {
    const bottomRegion = regionAverages[regionAverages.length - 1];
    insights.push({
      text: `${bottomRegion.region} has the lowest average food waste at ${bottomRegion.average.toFixed(1)} kg/capita/year.`,
      icon: <FiArrowDownRight size={18} />,
      type: "comparison",
      subtext: `Based on data from ${bottomRegion.count} countries in this region.`,
    });
  }

  // Household waste proportion
  const totalWaste = data.reduce(
    (sum, country) => sum + country.combinedFigures,
    0,
  );
  const householdWaste = data.reduce(
    (sum, country) => sum + country.householdEstimatePerCapita,
    0,
  );
  const retailWaste = data.reduce(
    (sum, country) => sum + country.retailEstimatePerCapita,
    0,
  );
  const foodServiceWaste = data.reduce(
    (sum, country) => sum + country.foodServiceEstimatePerCapita,
    0,
  );

  const householdPercentage = ((householdWaste / totalWaste) * 100).toFixed(1);
  const retailPercentage = ((retailWaste / totalWaste) * 100).toFixed(1);
  const foodServicePercentage = ((foodServiceWaste / totalWaste) * 100).toFixed(
    1,
  );

  insights.push({
    text: `Household waste makes up ${householdPercentage}% of total food waste globally.`,
    icon: <FiPieChart size={18} />,
    type: "stat",
    subtext: `Retail: ${retailPercentage}%, Food Service: ${foodServicePercentage}%`,
  });

  // Find countries with very high or low confidence data
  const highConfidenceCount = data.filter(
    (country) => country.confidenceInEstimate === "High Confidence",
  ).length;
  const lowConfidenceCount = data.filter(
    (country) => country.confidenceInEstimate === "Very Low Confidence",
  ).length;
  const mediumConfidenceCount = data.filter(
    (country) =>
      country.confidenceInEstimate !== "High Confidence" &&
      country.confidenceInEstimate !== "Very Low Confidence",
  ).length;

  insights.push({
    text: `Only ${highConfidenceCount} countries have high confidence data, while ${lowConfidenceCount} have very low confidence data.`,
    icon: <FiAlertTriangle size={18} />,
    type: "alert",
    subtext: `${mediumConfidenceCount} countries have medium confidence levels.`,
  });

  // Find a notable retail waste insight
  const retailWasteAverage =
    data.reduce((sum, country) => sum + country.retailEstimatePerCapita, 0) /
    data.length;

  // Find a region with high retail waste
  const highRetailRegion = regions
    .map((region) => {
      const countriesInRegion = filterData(data, { region });
      const retailAvg =
        countriesInRegion.reduce(
          (sum, country) => sum + country.retailEstimatePerCapita,
          0,
        ) / countriesInRegion.length;
      return { region, retailAvg, countryCount: countriesInRegion.length };
    })
    .sort((a, b) => b.retailAvg - a.retailAvg)[0];

  if (highRetailRegion) {
    insights.push({
      text: `${highRetailRegion.region} has the highest retail waste at ${highRetailRegion.retailAvg.toFixed(1)} kg/capita/year.`,
      icon: <FiArrowUpRight size={18} />,
      type: "comparison",
      subtext: `${((highRetailRegion.retailAvg / retailWasteAverage) * 100 - 100).toFixed(0)}% above global average, based on ${highRetailRegion.countryCount} countries.`,
    });
  }

  // Total global waste estimate
  const totalGlobalWaste = data.reduce(
    (sum, country) => sum + country.totalEstimatePerYear,
    0,
  );

  insights.push({
    text: `Estimated total global food waste is ${(totalGlobalWaste / 1000000).toFixed(1)} million tonnes per year.`,
    icon: <FiInfo size={18} />,
    type: "stat",
    subtext: `This represents significant environmental and economic impacts.`,
  });

  return insights;
}
