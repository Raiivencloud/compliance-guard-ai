import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AuditResult, AuditFinding, RiskLevel } from "../types";

const SYSTEM_INSTRUCTION = `Eres 'ComplianceGuard Engine', una IA especializada en derecho digital y seguridad de la información. Tu tarea es analizar Términos y Condiciones y Políticas de Privacidad de servicios de IA.

Tu salida debe ser exclusivamente un objeto JSON válido con la siguiente estructura:
{
  "score": (número),
  "summary": "resumen",
  "criticalRisks": (número),
  "advisoryWarnings": (número),
  "findings": [
    {
      "id": "string",
      "category": "Compliance|Privacy|Governance",
      "title": "título",
      "description": "explicación",
      "level": "critical|warning|safe",
      "color": "red|amber|blue",
      "lawRef": "Ley 25.326 (Arg) | GDPR (EU)",
      "recommendation": "acción"
    }
  ],
  "iaTraining": (boolean),
  "jurisdiction": "string"
}

Reglas: Evalúa contra Ley 25.326 (Argentina) y GDPR. Si detectas entrenamiento de modelos con datos del usuario, márcalo como 'critical'.`;

// Usamos la variable de entorno de Vite
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_KEY || "");

export async function runAudit(source: string | File): Promise<AuditResult> {
  // MODELOS ACTUALIZADOS A 2026
  const PRIMARY_MODEL = "gemini-3-flash"; 
  const FALLBACK_MODEL = "gemini-3-flash-preview";

  let content: any = null;

  if (typeof source === 'string') {
    content = [{ text: `Analiza este servicio: ${source}` }];
  } else {
    const base64Data = await fileToBase64(source);
    content = [
      { inlineData: { data: base64Data, mimeType: source.type } },
      { text: "Analiza la privacidad y el uso de datos en este documento." }
    ];
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: PRIMARY_MODEL,
      systemInstruction: SYSTEM_INSTRUCTION 
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: content }]
    });

    const responseText = result.response.text();
    // Limpieza de markdown por si la IA devuelve bloques de código
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    const rawJson = JSON.parse(cleanJson);

    return {
      ...rawJson,
      timestamp: new Date().toISOString(),
      fileName: source instanceof File ? source.name : "Texto pegado"
    };
  } catch (error) {
    console.error("Error con Gemini 3 Flash:", error);
    
    // Intento con el modelo Preview si el principal falla por cuota o región
    try {
      const fallback = genAI.getGenerativeModel({ model: FALLBACK_MODEL, systemInstruction: SYSTEM_INSTRUCTION });
      const res = await fallback.generateContent({ contents: [{ role: "user", parts: content }] });
      return JSON.parse(res.response.text().replace(/```json|```/g, "").trim());
    } catch (fError) {
      throw new Error("No se pudo conectar con los modelos de Gemini 3.");
    }
  }
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result?.toString().split(',')[1] || "");
    reader.onerror = reject;
  });
}
