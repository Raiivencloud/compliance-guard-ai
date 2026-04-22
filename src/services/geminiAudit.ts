import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AuditResult } from "../types";

const SYSTEM_INSTRUCTION = `Eres 'ComplianceGuard Engine'. Analiza el texto y devuelve SOLO un JSON con: score (1-100), summary, criticalRisks (número), advisoryWarnings (número) y findings (array). Cada finding debe tener id, category, title, description, level y color (red/yellow/blue).`;

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_KEY || "");

export async function runAudit(source: string | File): Promise<AuditResult> {
  // Solo los modelos más estables para no quemar créditos en errores 503
  const modelsToTry = ["gemini-3.1-pro-preview", "gemini-3-flash-preview"];
  
  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const textToAnalyze = typeof source === 'string' ? source : "Contenido de archivo: " + source.name;
      const prompt = `${SYSTEM_INSTRUCTION}\n\nTexto:\n${textToAnalyze}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);

      // Limpiamos los hallazgos para que React y Firestore los acepten sin chistar
      const safeFindings = (parsed.findings || []).slice(0, 5).map((f: any, i: number) => ({
        id: String(f.id || i),
        category: String(f.category || "General"),
        title: String(f.title || "Riesgo detectado"),
        description: String(f.description || "Revisión necesaria"),
        level: String(f.level || "warning"),
        color: String(f.color || (f.level === 'critical' ? 'red' : f.level === 'warning' ? 'yellow' : 'blue')),
        lawRef: String(f.lawRef || "N/A"),
        recommendation: String(f.recommendation || "Consultar legal")
      }));

      return {
        score: Number(parsed.score) || 0,
        summary: String(parsed.summary) || "Análisis completado.",
        criticalRisks: Number(parsed.criticalRisks) || 0,
        advisoryWarnings: Number(parsed.advisoryWarnings) || 0,
        findings: safeFindings,
        iaTraining: Boolean(parsed.iaTraining),
        jurisdiction: String(parsed.jurisdiction || "Global")
      };
    } catch (e) {
      console.warn("Reintentando con otro modelo...");
      continue;
    }
  }
  throw new Error("Saturación en Google. Reintentá en un minuto.");
}
