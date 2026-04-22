import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AuditResult } from "../types";

const SYSTEM_INSTRUCTION = `Eres 'ComplianceGuard Engine', experto en leyes de privacidad (Ley 25.326 Arg y GDPR). 
Analiza el texto y devuelve SIEMPRE un JSON con esta estructura:
{
  "score": (1-100),
  "summary": "resumen",
  "criticalRisks": (n),
  "advisoryWarnings": (n),
  "findings": [{ "id": "1", "category": "Privacy", "title": "...", "description": "...", "level": "critical", "color": "red", "lawRef": "...", "recommendation": "..." }],
  "iaTraining": true/false,
  "jurisdiction": "..."
}`;

// Usamos la API Key que configuraste en Netlify
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_KEY || "");

export async function runAudit(source: string | File): Promise<AuditResult> {
  // MODELO ACTUALIZADO 2026: Gemini 3 Flash
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3-flash",
    systemInstruction: SYSTEM_INSTRUCTION 
  });

  let textToAnalyze = "";
  if (typeof source === 'string') {
    textToAnalyze = source;
  } else {
    textToAnalyze = "Analizando archivo: " + source.name;
    // Nota: Para PDF reales necesitarías un extractor de texto, 
    // pero esto sirve para testear la conexión ahora.
  }

  try {
    const result = await model.generateContent(textToAnalyze);
    const response = await result.response;
    const text = response.text();
    
    // Limpieza de formato markdown
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Error en la API de Gemini:", error);
    throw new Error("No se pudo conectar con el motor de IA.");
  }
}
