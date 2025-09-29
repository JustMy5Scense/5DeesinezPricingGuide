
import { GoogleGenAI, Type } from "@google/genai";
import type { PricingInfo } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        suggestedPrices: {
            type: Type.OBJECT,
            properties: {
                lowEnd: { type: Type.NUMBER, description: "A budget-friendly price point to attract entry-level buyers." },
                marketRate: { type: Type.NUMBER, description: "A fair market price, balancing cost, effort, and value." },
                highEnd: { type: Type.NUMBER, description: "A premium price for high-quality craftsmanship or unique appeal." },
            },
            required: ["lowEnd", "marketRate", "highEnd"],
        },
        pricingRationale: {
            type: Type.STRING,
            description: "A detailed explanation for the suggested prices, considering materials, labor, market trends, and the item's perceived value from its description and photo."
        },
        marketingSuggestions: {
            type: Type.ARRAY,
            items: { 
                type: Type.STRING,
                description: "A creative marketing or sales suggestion."
            },
            description: "A list of 3-4 actionable marketing tips to help sell the item, tailored to the product type."
        }
    },
    required: ["suggestedPrices", "pricingRationale", "marketingSuggestions"],
};

export const getPricingAdvice = async (info: PricingInfo): Promise<string> => {
    const model = 'gemini-2.5-flash';
    
    const totalMaterialCost = info.materials.reduce((acc, material) => acc + (parseFloat(material.cost) || 0), 0);
    const materialList = info.materials.map(m => `- ${m.name}: $${parseFloat(m.cost).toFixed(2)}`).join('\n');
    const timeSpent = `${info.hours || 0} hours and ${info.minutes || 0} minutes`;

    const prompt = `
    As an expert e-commerce consultant specializing in handcrafted goods, provide a detailed pricing analysis for the following item.

    **Item Details:**
    - **Name:** ${info.itemName}
    - **Description:** ${info.itemDescription}

    **Cost Analysis:**
    - **Materials Used:**
    ${materialList}
    - **Total Material Cost:** $${totalMaterialCost.toFixed(2)}
    - **Time Spent:** ${timeSpent}
    - **Crafter's Desired Hourly Rate:** $${parseFloat(info.hourlyRate).toFixed(2)}
    - **Calculated Base Cost (Materials + Labor):** $${info.baseCost.toFixed(2)}

    Based on all this information (and the provided image, if any), please generate a pricing suggestion. Consider the item's uniqueness, potential market, quality suggested by the description, and overall appeal. Provide a thoughtful rationale and actionable marketing tips.
    `;
    
    const parts: any[] = [{ text: prompt }];

    if (info.itemImage) {
      parts.unshift({
        inlineData: {
          mimeType: info.itemImage.mimeType,
          data: info.itemImage.data,
        },
      });
    }

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: parts },
        config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
            temperature: 0.5,
        }
    });

    return response.text;
};
