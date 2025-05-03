import type { FoodWasteData } from "./types";

interface TrendDataPoint {
  year: number;
  combinedFigures: number;
  householdEstimatePerCapita: number;
  retailEstimatePerCapita: number;
  foodServiceEstimatePerCapita: number;
}

export interface CountryTrendData {
  country: string;
  region: string;
  trendData: TrendDataPoint[];
}

/**
 * Generates historical trend data for countries based on current data
 * Note: This is simulated data for demonstration purposes
 */
export function generateTrendData(
  currentData: FoodWasteData[],
  years = 5,
): CountryTrendData[] {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - years + 1;

  return currentData.map((country) => {
    // Generate trend data for each year with some random variation
    const trendData: TrendDataPoint[] = [];

    for (let year = startYear; year <= currentYear; year++) {
      // Calculate years from current
      const yearDiff = currentYear - year;

      // Add some random variation to create realistic trends
      // Simulating a historical decrease in waste management efforts
      const randomFactor = 1 + (Math.random() * 0.1 - 0.05); // +/- 5% random variation
      const yearFactor = 1 + yearDiff * 0.05; // Increases waste by 5% per year going back

      trendData.push({
        year,
        combinedFigures: Number(
          (country.combinedFigures * yearFactor * randomFactor).toFixed(1),
        ),
        householdEstimatePerCapita: Number(
          (
            country.householdEstimatePerCapita *
            yearFactor *
            randomFactor
          ).toFixed(1),
        ),
        retailEstimatePerCapita: Number(
          (country.retailEstimatePerCapita * yearFactor * randomFactor).toFixed(
            1,
          ),
        ),
        foodServiceEstimatePerCapita: Number(
          (
            country.foodServiceEstimatePerCapita *
            yearFactor *
            randomFactor
          ).toFixed(1),
        ),
      });
    }

    return {
      country: country.country,
      region: country.region,
      trendData: trendData.sort((a, b) => a.year - b.year), // Ensure chronological order
    };
  });
}

/**
 * Get trend data for specific countries
 */
export function getCountryTrendData(
  trendData: CountryTrendData[],
  countries: string[],
): CountryTrendData[] {
  return trendData.filter((data) => countries.includes(data.country));
}

/**
 * Calculate global average trend
 */
export function getGlobalTrendData(
  trendData: CountryTrendData[],
): TrendDataPoint[] {
  // Get all available years
  const years = [
    ...new Set(
      trendData.flatMap((country) =>
        country.trendData.map((point) => point.year),
      ),
    ),
  ].sort();

  return years.map((year) => {
    // Get all data points for this year
    const yearDataPoints = trendData.flatMap((country) =>
      country.trendData.filter((point) => point.year === year),
    );

    const count = yearDataPoints.length;

    return {
      year,
      combinedFigures: Number(
        (
          yearDataPoints.reduce(
            (sum, point) => sum + point.combinedFigures,
            0,
          ) / count
        ).toFixed(1),
      ),
      householdEstimatePerCapita: Number(
        (
          yearDataPoints.reduce(
            (sum, point) => sum + point.householdEstimatePerCapita,
            0,
          ) / count
        ).toFixed(1),
      ),
      retailEstimatePerCapita: Number(
        (
          yearDataPoints.reduce(
            (sum, point) => sum + point.retailEstimatePerCapita,
            0,
          ) / count
        ).toFixed(1),
      ),
      foodServiceEstimatePerCapita: Number(
        (
          yearDataPoints.reduce(
            (sum, point) => sum + point.foodServiceEstimatePerCapita,
            0,
          ) / count
        ).toFixed(1),
      ),
    };
  });
}

/**
 * Get regional trend data
 */
export function getRegionalTrendData(
  trendData: CountryTrendData[],
  region: string,
): TrendDataPoint[] {
  // Filter countries by region
  const regionData = trendData.filter((country) => country.region === region);

  // Use the same calculation as global trend but for region only
  return getGlobalTrendData(regionData);
}
