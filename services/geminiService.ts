
import { GoogleGenAI, Type } from "@google/genai";
import { Invoice, InventoryBatch, AIInsight } from "../types";

// Fix: Initializing GoogleGenAI with a named parameter as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDemandForecast = async (
  invoices: Invoice[],
  inventory: InventoryBatch[],
  itemNames: string[]
): Promise<AIInsight[]> => {
  // Fix: Removed explicit process.env.API_KEY check as it's assumed to be pre-configured
  const historicalData = invoices.map(inv => ({
    date: inv.invoiceDate,
    items: inv.items.map(i => ({ name: i.itemName, qty: i.quantity }))
  }));

  const inventorySummary = inventory.map(i => ({
    name: i.itemName,
    stock: i.quantityRemaining
  }));

  const prompt = `
    Analyze this school supply business historical sales data:
    ${JSON.stringify(historicalData)}

    Current Inventory:
    ${JSON.stringify(inventorySummary)}

    For these items: ${itemNames.join(', ')}

    Predict demand for the next 30/60/90 days, suggest reorder quantities, and provide a textual insight.
    Return only valid JSON matching the schema provided.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              itemName: { type: Type.STRING },
              predictedDemand: { type: Type.NUMBER, description: 'Next 30 days demand' },
              suggestedReorder: { type: Type.NUMBER },
              estimatedStockoutDate: { type: Type.STRING },
              insight: { type: Type.STRING }
            },
            required: ['itemName', 'predictedDemand', 'suggestedReorder', 'estimatedStockoutDate', 'insight']
          }
        }
      }
    });

    // Fix: Using response.text property (not a method) as per guidelines
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("AI Error:", error);
    return [];
  }
};
