export interface FoodWasteData {
  country: string;
  combinedFigures: number;
  householdEstimatePerCapita: number;
  householdEstimateTotal: number;
  retailEstimatePerCapita: number;
  retailEstimateTotal: number;
  foodServiceEstimatePerCapita: number;
  foodServiceEstimateTotal: number;
  confidenceInEstimate: ConfidenceLevel;
  m49Code: number;
  region: string;
  source: string;
}

export type ConfidenceLevel =
  | "Very Low Confidence"
  | "Low Confidence"
  | "Medium Confidence"
  | "High Confidence";

export interface RegionData {
  region: string;
  averageCombinedFigures: number;
  totalCountries: number;
  totalHouseholdWaste: number;
  totalRetailWaste: number;
  totalFoodServiceWaste: number;
}

export interface ConfidenceData {
  confidenceLevel: ConfidenceLevel;
  count: number;
  averageCombinedFigures: number;
}

export interface WasteDistribution {
  household: number;
  retail: number;
  foodService: number;
}

export interface ComparisonData {
  country: string;
  combinedFigures: number;
  wasteSources: WasteDistribution;
}

export type WasteType = "combined" | "household" | "retail" | "foodService";

export interface FilterOptions {
  region?: string;
  confidence?: ConfidenceLevel;
  minWaste?: number;
  maxWaste?: number;
  wasteType?: WasteType;
}
