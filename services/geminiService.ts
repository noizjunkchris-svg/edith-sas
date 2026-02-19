
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

export const analyzeProductImage = async (base64Image: string): Promise<Partial<Product>> => {
  // On récupère la clé : soit l'env, soit le stockage local manuel
  const apiKey = localStorage.getItem('gemini_api_key') || process.env.API_KEY || "";
  
  if (!apiKey || apiKey === "undefined" || apiKey === "null") {
    throw new Error("Clé API manquante ou invalide.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
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
            text: "Extraire les informations du produit depuis cette étiquette ou ce code-barres : Code-Barre (EAN), Marque, Modèle/SKU, Nom du produit, Taille, Prix estimé en EUR, Couleur dominante, Saison (ex: FW24).",
          },
        ],
      },
      config: {
        systemInstruction: `Tu es un assistant expert en logistique streetwear et mode. Tu dois analyser les images d'étiquettes de vêtements ou chaussures pour en extraire les métadonnées. Réponds uniquement en JSON pur.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            barcode: { type: Type.STRING },
            brand: { type: Type.STRING },
            model: { type: Type.STRING },
            name: { type: Type.STRING },
            size: { type: Type.STRING },
            price: { type: Type.STRING },
            color: { type: Type.STRING },
            season: { type: Type.STRING },
            productType: { type: Type.STRING },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("L'IA n'a pas pu lire l'image.");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
