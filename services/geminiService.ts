
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseReceiptImage = async (base64Image: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          text: 'Parse this receipt and extract the merchant name, total amount, and category (e.g., Groceries, Rent, Dining, Utilities, Travel). Return strictly JSON.'
        }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          merchant: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          category: { type: Type.STRING },
        },
        required: ['merchant', 'amount', 'category']
      }
    }
  });

  return JSON.parse(response.text);
};

export const suggestCategory = async (description: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest a standard expense category for this description: "${description}". Choose from: Rent, Groceries, Utilities, Dining, Travel, Entertainment, Other. Return only the category name.`,
  });

  return response.text.trim();
};
