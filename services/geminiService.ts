
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

export const analyzeProductImage = async (base64Image: string): Promise<Partial<Product>> => {
  // Récupération de la clé avec priorité au stockage local
  const storedKey = localStorage.getItem('gemini_api_key');
  const envKey = process.env.API_KEY;
  
  const apiKey = (storedKey && storedKey.length > 5) ? storedKey : envKey;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "null") {
    throw new Error("Clé API manquante ou invalide dans les réglages.");
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
            text: "Analyse cette étiquette de vêtement/sneakers. Extrais : Code-Barre (chiffres), Marque, Modèle, Nom du produit, Taille, Prix, Couleur, Saison (ex: FW24), Type (ex: Veste). Réponds uniquement en JSON.",
          },
        ],
      },
      config: {
        systemInstruction: "Tu es un expert en logistique mode. Tu dois extraire les données techniques. Réponds exclusivement au format JSON pur, sans balises de code markdown, sans texte avant ou après.",
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

    let resultText = response.text || "";
    
    // Nettoyage au cas où l'IA envoie quand même du Markdown
    resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    if (!resultText) throw new Error("L'IA n'a pas pu extraire de données exploitables.");
    
    try {
      return JSON.parse(resultText);
    } catch (parseError) {
      console.error("JSON Parse Error. Raw text:", resultText);
      throw new Error("Format de réponse invalide de l'IA.");
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error("La clé API est invalide. Veuillez la modifier.");
    }
    throw error;
  }
};
