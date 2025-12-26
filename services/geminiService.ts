
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { FoodItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const recognizeFood = async (base64Image: string): Promise<FoodItem[]> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
              },
            },
            {
              text: "分析这张食物照片。识别所有食物项、它们的分量（例如“1杯”、“100克”、“1片”）、预计热量（大卡），以及它们的边界框（归一化坐标 0-1000：[ymin, xmin, ymax, xmax]）。请务必使用中文返回食物名称和分量。返回格式严格遵循 JSON。",
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "食物的中文名称" },
              portion: { type: Type.STRING, description: "食物的分量描述" },
              calories: { type: Type.NUMBER, description: "热量值（单位：大卡）" },
              boundingBox: {
                type: Type.OBJECT,
                properties: {
                  ymin: { type: Type.NUMBER },
                  xmin: { type: Type.NUMBER },
                  ymax: { type: Type.NUMBER },
                  xmax: { type: Type.NUMBER },
                },
                required: ["ymin", "xmin", "ymax", "xmax"],
              },
            },
            required: ["name", "portion", "calories", "boundingBox"],
          },
        },
      },
    });

    const jsonStr = response.text;
    const parsed: any[] = JSON.parse(jsonStr || '[]');
    
    return parsed.map((item, index) => ({
      ...item,
      id: `food-${Date.now()}-${index}`,
    }));
  } catch (error) {
    console.error("Gemini recognition failed:", error);
    throw error;
  }
};
