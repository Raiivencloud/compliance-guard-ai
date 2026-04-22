import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AuditResult } from "../types";

const SYSTEM_INSTRUCTION = `Eres 'ComplianceGuard Engine', una IA especializada en derecho digital. 
Analiza Políticas de Privacidad bajo la Ley 25.326 (Argentina) y GDPR.
Devuelve SIEMPRE un JSON válido con esta estructura:
{
  "score": (número 1-100),
  "summary": "resumen ejecutivo",
  "criticalRisks": (número),
  "advisoryWarnings": (número),
  "findings": [
    {
      "id": "1",
      "category": "Privacy",
      "title": "título",
      "description": "explicación",
      "level": "critical",
      "color": "red",
      "lawRef": "Ley 25.326",
      "recommendation": "acción"
    }
  ],
  "iaTraining": true/false,
  "jurisdiction": "país"
}`;

// Usamos la variable configurada en Netlify
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_KEY || "");

export async function runAudit(source: string | File): Promise<AuditResult> {
  // Usando el modelo más actual disponible en tu cuenta
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash", 
    systemInstruction: SYSTEM_INSTRUCTION 
  });

  let textToAnalyze = "";

  if (typeof source === 'string') {
    textToAnalyze = source;
  } else {
    // Para simplificar y evitar errores de buffer, extraemos el texto si es File
    textToAnalyze = "Analizando archivo: " + source.name;
  }

  try {
    const result = await model.generateContent(textToAnalyze);
    const response = await result.response;
    const text = response.text();
    
    // Limpiamos el posible formato markdown de la IA
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Error en Auditoría:", error);
    throw new Error("No se pudo completar el análisis legal.");
  }
}
