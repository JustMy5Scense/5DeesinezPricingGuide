
export interface Material {
  id: string;
  name: string;
  cost: string; // Use string for input field binding
}

export interface PricingInfo {
  itemName: string;
  itemDescription: string;
  materials: Material[];
  hours: string;
  minutes: string;
  hourlyRate: string;
  baseCost: number;
  itemImage?: {
    mimeType: string;
    data: string;
  };
}

export interface GeminiResponse {
    suggestedPrices: {
        lowEnd: number;
        marketRate: number;
        highEnd: number;
    };
    pricingRationale: string;
    marketingSuggestions: string[];
}

export interface PricingSuggestion extends GeminiResponse {
  baseCost: number;
  profitAnalysis: {
    lowEndProfit: number;
    marketRateProfit: number;
    highEndProfit: number;
  };
}
