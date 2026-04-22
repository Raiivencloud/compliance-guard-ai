import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AuditResult } from "../types";

const SYSTEM_INSTRUCTION = `Actúa como 'ComplianceGuard Engine'. Analiza el texto legal y genera UNICAMENTE un objeto JSON.
IMPORTANTE: Cada objeto en el array 'findings' DEBE incluir el campo 'color' ("red", "yellow" o "blue").`;

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_KEY || "");

export async function runAudit(source: string | File): Promise<AuditResult> {
  // MODELOS EXACTOS DE GOOGLE AI STUDIO (Abril 2026)
  const modelsToTry = [
    "gemini-3-flash-preview", 
    "gemini-3.1-pro-preview" // El modelo de respaldo Pro actualizado
  ];
  
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
      const parsed = JSON.parse(cleanJson);

      // Limpieza de datos para evitar la pantalla blanca
      const safeFindings = (parsed.findings || []).map((f: any, index: number) => ({
        id: f.id || String(index),
        category: f.category || "General",
        title: f.title || "Hallazgo detectado",
        description: f.description || "Sin descripción",
        level: f.level || "warning",
        color: f.color || (f.level === 'critical' ? 'red' : 'yellow'),
        lawRef: f.lawRef || "N/A",
        recommendation: f.recommendation || "Revisar términos"
      }));

      return {
        score: parsed.score || 0,
        summary: parsed.summary || "Resumen no disponible.",
        criticalRisks: parsed.criticalRisks || 0,
        advisoryWarnings: parsed.advisoryWarnings || 0,
        findings: safeFindings,
        iaTraining: !!parsed.iaTraining,
        jurisdiction: parsed.jurisdiction || "Global"
      };

    } catch (error) {
      console.warn(`Fallo en ${modelName}, intentando con el respaldo...`);
      lastError = error;
      continue;
    }
  }
  
  throw new Error("Los servidores de Google están saturados (503). Reintentá en un minuto.");
}
