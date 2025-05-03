import type {
  ComparisonData,
  ConfidenceData,
  ConfidenceLevel,
  FilterOptions,
  FoodWasteData,
  RegionData,
  WasteDistribution,
} from "./types";

/**
 * Fetches food waste data from the CSV file
 */
export async function fetchFoodWasteData(): Promise<FoodWasteData[]> {
  const response = await fetch("/data/food-waste-data.csv");
  const csvText = await response.text();

  // Parse CSV data manually since we're in the browser
  const rows = csvText.split("\n");
  const headers = rows[0].split(",");

  const data: FoodWasteData[] = [];

  for (let i = 1; i < rows.length; i++) {
    if (!rows[i].trim()) continue;

    const values = rows[i].split(",");

    // Skip rows with incorrect data
    if (values.length !== headers.length) continue;

    data.push({
      country: values[0],
      combinedFigures: Number.parseFloat(values[1]),
      householdEstimatePerCapita: Number.parseFloat(values[2]),
      householdEstimateTotal: Number.parseFloat(values[3]),
      retailEstimatePerCapita: Number.parseFloat(values[4]),
      retailEstimateTotal: Number.parseFloat(values[5]),
      foodServiceEstimatePerCapita: Number.parseFloat(values[6]),
      foodServiceEstimateTotal: Number.parseFloat(values[7]),
      confidenceInEstimate: values[8] as ConfidenceLevel,
      m49Code: Number.parseInt(values[9]),
      region: values[10],
      source: values[11],
    });
  }

  return data;
}

/**
 * Filters food waste data based on the provided options
 */
export function filterData(
  data: FoodWasteData[],
  options?: FilterOptions,
): FoodWasteData[] {
  if (!options) return data;

  let filteredData = [...data];

  if (options.region) {
    filteredData = filteredData.filter(
      (item) => item.region === options.region,
    );
  }

  if (options.confidence) {
    filteredData = filteredData.filter(
      (item) => item.confidenceInEstimate === options.confidence,
    );
  }

  if (options.minWaste !== undefined) {
    filteredData = filteredData.filter(
      (item) => item.combinedFigures >= options.minWaste,
    );
  }

  if (options.maxWaste !== undefined) {
    filteredData = filteredData.filter(
      (item) => item.combinedFigures <= options.maxWaste,
    );
  }

  if (options.wasteType) {
    switch (options.wasteType) {
      case "household":
        filteredData = filteredData.map((item) => ({
          ...item,
          combinedFigures: item.householdEstimatePerCapita,
        }));
        break;
      case "retail":
        filteredData = filteredData.map((item) => ({
          ...item,
          combinedFigures: item.retailEstimatePerCapita,
        }));
        break;
      case "foodService":
        filteredData = filteredData.map((item) => ({
          ...item,
          combinedFigures: item.foodServiceEstimatePerCapita,
        }));
        break;
      default:
        // combined - no changes needed
        break;
    }
  }

  return filteredData;
}

/**
 * Groups data by region and calculates regional statistics
 */
export function getRegionData(data: FoodWasteData[]): RegionData[] {
  const regionMap = new Map<string, FoodWasteData[]>();

  // Group data by region - replace forEach with for...of loop
  for (const item of data) {
    if (!regionMap.has(item.region)) {
      regionMap.set(item.region, []);
    }
    const regionItems = regionMap.get(item.region);
    if (regionItems) {
      regionItems.push(item);
    }
  }

  // Calculate regional statistics
  const regionData: RegionData[] = [];

  // Replace forEach with for...of loop
  for (const [region, regionItems] of regionMap.entries()) {
    const totalCountries = regionItems.length;
    let totalCombinedFigures = 0;
    let totalHouseholdWaste = 0;
    let totalRetailWaste = 0;
    let totalFoodServiceWaste = 0;

    for (const item of regionItems) {
      totalCombinedFigures += item.combinedFigures;
      totalHouseholdWaste += item.householdEstimatePerCapita;
      totalRetailWaste += item.retailEstimatePerCapita;
      totalFoodServiceWaste += item.foodServiceEstimatePerCapita;
    }

    regionData.push({
      region,
      averageCombinedFigures: totalCombinedFigures / totalCountries,
      totalCountries,
      totalHouseholdWaste,
      totalRetailWaste,
      totalFoodServiceWaste,
    });
  }

  return regionData.sort(
    (a, b) => b.averageCombinedFigures - a.averageCombinedFigures,
  );
}

/**
 * Groups data by confidence level and calculates statistics
 */
export function getConfidenceData(data: FoodWasteData[]): ConfidenceData[] {
  const confidenceMap = new Map<ConfidenceLevel, FoodWasteData[]>();

  // Group data by confidence level - replace forEach with for...of loop
  for (const item of data) {
    if (!confidenceMap.has(item.confidenceInEstimate)) {
      confidenceMap.set(item.confidenceInEstimate, []);
    }
    const confidenceItems = confidenceMap.get(item.confidenceInEstimate);
    if (confidenceItems) {
      confidenceItems.push(item);
    }
  }

  // Calculate confidence statistics
  const confidenceData: ConfidenceData[] = [];

  // Replace forEach with for...of loop
  for (const [confidenceLevel, confidenceItems] of confidenceMap.entries()) {
    const count = confidenceItems.length;
    let totalCombinedFigures = 0;

    for (const item of confidenceItems) {
      totalCombinedFigures += item.combinedFigures;
    }

    confidenceData.push({
      confidenceLevel,
      count,
      averageCombinedFigures: totalCombinedFigures / count,
    });
  }

  return confidenceData;
}

/**
 * Gets comparison data for specified countries
 */
export function getComparisonData(
  data: FoodWasteData[],
  countries: string[],
): ComparisonData[] {
  const filteredData = data.filter((item) => countries.includes(item.country));

  return filteredData.map((item) => {
    const total =
      item.householdEstimatePerCapita +
      item.retailEstimatePerCapita +
      item.foodServiceEstimatePerCapita;

    return {
      country: item.country,
      combinedFigures: item.combinedFigures,
      wasteSources: {
        household: item.householdEstimatePerCapita / total,
        retail: item.retailEstimatePerCapita / total,
        foodService: item.foodServiceEstimatePerCapita / total,
      },
    };
  });
}

/**
 * Gets the top N countries by combined food waste
 */
export function getTopWasteCountries(
  data: FoodWasteData[],
  count = 10,
): FoodWasteData[] {
  return [...data]
    .sort((a, b) => b.combinedFigures - a.combinedFigures)
    .slice(0, count);
}

/**
 * Gets all unique regions
 */
export function getAllRegions(data: FoodWasteData[]): string[] {
  const regionsSet = new Set<string>();

  // Replace forEach with for...of loop
  for (const item of data) {
    regionsSet.add(item.region);
  }

  return Array.from(regionsSet).sort();
}

/**
 * Calculates the waste source distribution for a country
 */
export function getWasteDistribution(
  data: FoodWasteData,
  percentage = true,
): WasteDistribution {
  const total =
    data.householdEstimatePerCapita +
    data.retailEstimatePerCapita +
    data.foodServiceEstimatePerCapita;

  if (percentage) {
    return {
      household: (data.householdEstimatePerCapita / total) * 100,
      retail: (data.retailEstimatePerCapita / total) * 100,
      foodService: (data.foodServiceEstimatePerCapita / total) * 100,
    };
  }

  return {
    household: data.householdEstimatePerCapita,
    retail: data.retailEstimatePerCapita,
    foodService: data.foodServiceEstimatePerCapita,
  };
}

/**
 * Gets a list of countries sorted by name
 */
export function getAllCountries(data: FoodWasteData[]): string[] {
  return data.map((item) => item.country).sort();
}
