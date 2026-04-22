import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AuditResult } from "../types";

const SYSTEM_INSTRUCTION = `Eres 'ComplianceGuard Engine', experto en leyes de privacidad y seguridad de datos. 
Analiza el texto y devuelve SIEMPRE un JSON con esta estructura:
{
  "score": (número del 1 al 100),
  "summary": "resumen breve",
  "criticalRisks": (cantidad),
  "advisoryWarnings": (cantidad),
  "findings": [
    {
      "id": "1",
      "category": "Privacy",
      "title": "...",
      "description": "...",
      "level": "critical",
      "color": "red",
      "lawRef": "GDPR / Ley 25.326",
      "recommendation": "..."
    }
  ],
  "iaTraining": true/false,
  "jurisdiction": "Global/Argentina"
}`;

// Usamos la variable de entorno que ya configuraste bien en Netlify
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_KEY || "");

export async function runAudit(source: string | File): Promise<AuditResult> {
  try {
    // CAMBIO CLAVE: Usamos gemini-3-flash que es el modelo de 2026
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash",
      systemInstruction: SYSTEM_INSTRUCTION 
    });

    let textToAnalyze = "";
    if (typeof source === 'string') {
      textToAnalyze = source;
    } else {
      textToAnalyze = "Analizando archivo: " + source.name;
      // Para pruebas, si es archivo, le mandamos un placeholder 
      // (luego podés agregar un extractor de PDF)
    }

    const result = await model.generateContent(textToAnalyze);
    const response = await result.response;
    const text = response.text();
    
    // Limpieza de posibles bloques markdown que devuelva la IA
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Error en la conexión con Gemini 3:", error);
    throw new Error("El motor de IA no respondió. Verificá la cuota de tu API Key.");
  }
}
