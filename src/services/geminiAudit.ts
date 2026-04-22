import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AuditResult } from "../types";

const SYSTEM_INSTRUCTION = `Actúa como 'ComplianceGuard Engine'. Analiza el texto legal y genera UNICAMENTE un objeto JSON.
IMPORTANTE: Cada objeto en el array 'findings' DEBE incluir obligatoriamente el campo 'color' siendo este "red", "yellow" o "blue" según la gravedad.`;

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_KEY || "");

export async function runAudit(source: string | File): Promise<AuditResult> {
  // Lista de modelos para probar en orden de prioridad
  const modelsToTry = ["gemini-3-flash-preview", "gemini-3-pro-preview"];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      let textToAnalyze = typeof source === 'string' ? source : "Analizando archivo: " + source.name;
      const prompt = `${SYSTEM_INSTRUCTION}\n\nTexto:\n${textToAnalyze}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanJson = text.replace(/```json|```/g, "").trim();
      const parsed: AuditResult = JSON.parse(cleanJson);

      // BLINDAJE: Aseguramos colores para que no explote la web
      if (parsed.findings) {
        parsed.findings = parsed.findings.map(f => ({
          ...f,
          color: f.color || (f.level === 'critical' ? 'red' : f.level === 'warning' ? 'yellow' : 'blue')
        }));
      }
      return parsed;

    } catch (error) {
      console.warn(`Modelo ${modelName} falló o saturado. Probando siguiente...`);
      lastError = error;
      continue; // Salta al siguiente modelo
    }
  }

  throw new Error("Todos los motores de IA están bajo alta demanda. Reintentá en un minuto.");
}
