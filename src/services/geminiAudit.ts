import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AuditResult } from "../types";

const SYSTEM_INSTRUCTION = `Eres 'ComplianceGuard Engine', experto en leyes de privacidad (Ley 25.326 Arg y GDPR). 
Analiza el texto y devuelve SIEMPRE un JSON válido con score (1-100), summary y findings.`;

// Conectamos con la llave de Google AI Studio configurada en Netlify
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_KEY || "");

export async function runAudit(source: string | File): Promise<AuditResult> {
  try {
    // Usamos el modelo estable para 2026
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash",
      systemInstruction: SYSTEM_INSTRUCTION 
    });

    let textToAnalyze = "";
    if (typeof source === 'string') {
      textToAnalyze = source;
    } else {
      textToAnalyze = "Documento: " + source.name + ". Analiza los términos de privacidad.";
    }

    const result = await model.generateContent(textToAnalyze);
    const response = await result.response;
    const text = response.text();
    
    // Limpiamos el texto por si la IA devuelve bloques de código markdown
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Error crítico en Gemini 3:", error);
    throw new Error("No se pudo conectar con el motor de IA.");
  }
}
