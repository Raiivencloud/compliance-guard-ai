import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AuditResult } from "../types";

const SYSTEM_INSTRUCTION = `Actúa como 'ComplianceGuard Engine'. 
Analiza el texto legal y genera UNICAMENTE un objeto JSON con:
score (1-100), summary (string), criticalRisks (number), advisoryWarnings (number), 
findings (array de objetos con id, category, title, description, level, color, lawRef, recommendation),
iaTraining (boolean) y jurisdiction (string).`;

// Usamos la API KEY de Google AI Studio (la que empieza con AIza...)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_KEY || "");

export async function runAudit(source: string | File): Promise<AuditResult> {
  try {
    // MODELO ESPECIFICO: gemini-3-flash-preview
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview" 
    });

    let textToAnalyze = "";
    if (typeof source === 'string') {
      textToAnalyze = source;
    } else {
      // Nota: Si mandas archivos, asegúrate de extraer el texto antes 
      // o usar la capacidad multimodal del modelo.
      textToAnalyze = "Analizando contenido de: " + source.name;
    }

    const prompt = `${SYSTEM_INSTRUCTION}\n\nTexto a procesar:\n${textToAnalyze}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Limpieza de bloques de código markdown
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);

  } catch (error: any) {
    console.error("Error en Gemini 3 Preview:", error);
    
    // Si el modelo preview falla o no está disponible, el sistema 
    // debería intentar con el modelo pro si así lo configuraste.
    throw new Error("El motor de IA (Gemini 3 Flash Preview) no respondió. Revisa tu cuota en AI Studio.");
  }
}
