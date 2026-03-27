import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AnalysisResult {
  condition: string;
  confidence: number;
  severity: "Low" | "Medium" | "High";
  features: string[];
  recommendations: string[];
  disclaimer: string;
}

export const analyzeSkinImage = async (base64Image: string): Promise<AnalysisResult> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Analyze this skin image and identify potential skin conditions. 
  Provide the result in JSON format with the following fields:
  - condition: Name of the predicted skin condition.
  - confidence: A number between 0 and 100 representing the probability.
  - severity: One of "Low", "Medium", or "High".
  - features: A list of detected visual features (e.g., redness, inflammation).
  - recommendations: A list of basic skincare steps and advice on when to consult a doctor.
  - disclaimer: A medical disclaimer stating this is an AI analysis and not a professional diagnosis.`;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: prompt },
        { inlineData: { mimeType: "image/jpeg", data: base64Image.split(",")[1] } }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          condition: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          severity: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          features: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          disclaimer: { type: Type.STRING }
        },
        required: ["condition", "confidence", "severity", "features", "recommendations", "disclaimer"]
      }
    }
  });

  return JSON.parse(response.text);
};
