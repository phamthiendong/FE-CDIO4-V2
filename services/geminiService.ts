

import { GoogleGenAI, Type } from "@google/genai";
import type { SpecialtySuggestion } from '../types';

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  // In a real app, you might want to handle this more gracefully.
  // For this context, we assume the API key is provided.
  console.warn("API_KEY is not set. AI features will not work.");
}


export async function getSpecialtySuggestions(symptoms: string): Promise<SpecialtySuggestion[]> {
  if (!ai) {
    throw new Error("AI Service not initialized. API_KEY is missing.");
  }

  const prompt = `
    You are an AI medical assistant for a telehealth platform. Based on the following user-provided symptoms, suggest up to three relevant medical specialties they should consider for a consultation. For each specialty, provide a brief, easy-to-understand reason. Also, provide an estimated risk level ('Thấp', 'Trung bình', or 'Cao') based on the severity and nature of the symptoms described.

    Symptoms: "${symptoms}"

    Return the result as a JSON array of objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              specialty: {
                type: Type.STRING,
                description: 'The medical specialty suggested (e.g., "Cardiology", "Dermatology").',
              },
              reason: {
                type: Type.STRING,
                description: 'A brief explanation of why this specialty is relevant to the provided symptoms.',
              },
              riskLevel: {
                type: Type.STRING,
                description: "An estimated risk level for the symptoms. Must be one of: 'Thấp', 'Trung bình', 'Cao'.",
              }
            },
            required: ["specialty", "reason", "riskLevel"],
          },
        },
      },
    });

    const responseText = response.text.trim();
    // The Gemini API can sometimes return a single object instead of an array if only one suggestion is found
    const parsedResponse = JSON.parse(responseText);
    const suggestions: SpecialtySuggestion[] = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];
    
    return suggestions;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get suggestions from AI model.");
  }
}

export async function getIcd10Suggestions(summary: string): Promise<{ code: string; description: string }[]> {
  if (!ai) {
    throw new Error("AI Service not initialized. API_KEY is missing.");
  }

  const prompt = `
    Based on the following consultation summary, suggest up to three relevant ICD-10 codes.
    For each suggestion, provide the code and a brief description in Vietnamese.

    Consultation Summary: "${summary}"

    Return the result as a JSON array of objects.
  `;

  try {
     const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              code: {
                type: Type.STRING,
                description: 'The ICD-10 code (e.g., "J02.9").',
              },
              description: {
                type: Type.STRING,
                description: 'The Vietnamese description of the code (e.g., "Viêm họng cấp, không xác định").',
              },
            },
            required: ["code", "description"],
          },
        },
      },
    });

    const responseText = response.text.trim();
    const parsedResponse = JSON.parse(responseText);
    return Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];

  } catch (error) {
    console.error("Error calling Gemini API for ICD-10:", error);
    throw new Error("Failed to get ICD-10 suggestions from AI model.");
  }
}