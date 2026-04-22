import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AuditResult } from "../types";

const SYSTEM_INSTRUCTION = `Actúa como 'ComplianceGuard Engine'. 
Analiza el texto legal y genera UNICAMENTE un objeto JSON.
IMPORTANTE: Cada objeto en el array 'findings' DEBE incluir obligatoriamente el campo 'color' siendo este "red", "yellow" o "blue" según la gravedad.`;

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_KEY || "");

export async function runAudit(source: string | File): Promise<AuditResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    let textToAnalyze = typeof source === 'string' ? source : "Analizando archivo: " + source.name;

    const prompt = `${SYSTEM_INSTRUCTION}\n\nTexto:\n${textToAnalyze}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanJson = text.replace(/```json|```/g, "").trim();
    const parsed: AuditResult = JSON.parse(cleanJson);

    // BLINDAJE: Si la IA no mandó colores, se los asignamos nosotros para que no explote la web
    if (parsed.findings) {
      parsed.findings = parsed.findings.map(f => ({
        ...f,
        color: f.color || (f.level === 'critical' ? 'red' : f.level === 'warning' ? 'yellow' : 'blue')
      }));
    }

    return parsed;
  } catch (error) {
    console.error("Error en auditoría:", error);
    throw new Error("Error al procesar los datos de la IA.");
  }
}
