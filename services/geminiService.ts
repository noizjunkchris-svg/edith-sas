
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

export const analyzeProductImage = async (base64Image: string): Promise<Partial<Product>> => {
  // Utilisation exclusive de la clé environnement comme requis
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Configuration système : Clé API non détectée.");
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
            text: "Ceci est une étiquette de produit Streetwear/Fashion. Extrais les informations suivantes : 1. Barcode (le code numérique sous les barres), 2. Brand (Marque), 3. Model (Référence technique type ADYDP...), 4. Name (Nom du modèle), 5. Size (Taille), 6. Price (Prix en EUR de préférence), 7. Color, 8. Season (ex: FW24). Réponds uniquement en JSON.",
          },
        ],
      },
      config: {
        systemInstruction: "Tu es un expert en logistique mode. Tu sais lire les étiquettes même si le texte est vertical ou s'il y a plusieurs devises. Extrais les données au format JSON pur. Si une donnée manque, utilise 'N/A'.",
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
          },
        },
      },
    });

    const resultText = response.text || "";
    return JSON.parse(resultText.replace(/```json/g, "").replace(/```/g, "").trim());
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(error.message || "Erreur d'analyse de l'étiquette");
  }
};
