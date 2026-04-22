import { GoogleGenAI, Type } from "@google/genai";
import type { AuditResult, AuditFinding, RiskLevel } from "../types";

const SYSTEM_INSTRUCTION = `Eres 'ComplianceGuard Engine', una IA especializada en derecho digital y seguridad de la información. Tu tarea es analizar Términos y Condiciones y Políticas de Privacidad de servicios de IA.

Tu salida debe ser exclusivamente un objeto JSON válido con la siguiente estructura:
{
  "score": (número del 1 al 100, donde 100 es seguro),
  "summary": "resumen ejecutivo corto",
  "criticalRisks": (cantidad de hallazgos críticos/rojos),
  "advisoryWarnings": (cantidad de hallazgos advertencia/ámbar),
  "findings": [
    {
      "id": "string",
      "category": "Compliance|Privacy|Governance",
      "title": "título de la cláusula",
      "description": "explicación simple del riesgo",
      "level": "critical|warning|safe",
      "color": "red|amber|blue",
      "lawRef": "Ley 25.326 (Arg) | GDPR (EU)",
      "recommendation": "qué debe hacer el usuario"
    }
  ],
  "iaTraining": (booleano: ¿usan datos para entrenar?),
  "jurisdiction": "país/región legal"
}

Reglas críticas:
1. Marcos Legales: Evalúa rigurosamente contra la Ley 25.326 de Protección de Datos Personales (Argentina), las Resoluciones de la AAIP sobre biometría, el GDPR (EU) y el EU AI Act.
2. Color mapping: 'critical' -> 'red', 'warning' -> 'amber', 'safe' -> 'blue'.
3. Referencia Legal: Cada hallazgo debe especificar si infringe la Ley 25.326 (Arg) o el GDPR (EU) en el campo 'lawRef'.
4. Optimización: Enfócate en Data Usage, Privacy y Model Training.
5. Validación: Si el texto no es una política legítima, devuelve: {"error": "Documento no válido."}
6. Criterio: Sé pesimista; ante la duda, prioridad crítica.`;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function runAudit(source: string | File): Promise<AuditResult> {
  const PRIMARY_MODEL = "gemini-3-flash-preview";
  const FALLBACK_MODEL = "gemini-3.1-pro-preview";
  
  let content: any = null;

  if (typeof source === 'string') {
    content = [{ text: `Analiza las secciones de Privacidad y Uso de Datos de este servicio: ${source}. Prioriza la detección de uso de datos para entrenamiento de IA.` }];
  } else {
    const base64Data = await fileToBase64(source);
    content = [
      { inlineData: { data: base64Data, mimeType: source.type } },
      { text: "Analiza exclusivamente las cláusulas de Privacidad, Uso de Datos y Entrenamiento de Modelos en este documento." }
    ];
  }

  try {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: content,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });

    const responseText = response.text;
    const rawJson = JSON.parse(responseText.replace(/```json|```/g, ""));

    if (rawJson.error) throw new Error(rawJson.error);

    return {
      ...rawJson,
      timestamp: new Date().toISOString(),
      url: typeof source === 'string' ? source : undefined,
      fileName: source instanceof File ? source.name : undefined
    };
  } catch (error: any) {
    console.error("Gemini Audit Error:", error);
    // Silent Fallback to Flash
    try {
      const response = await ai.models.generateContent({ 
        model: FALLBACK_MODEL, 
        contents: content,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION
        }
      });
      const rawJson = JSON.parse(response.text.replace(/```json|```/g, ""));
      return { ...rawJson, timestamp: new Date().toISOString() };
    } catch (fallbackError) {
       throw new Error("Error crítico en ComplianceGuard Engine.");
    }
  }
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result?.toString().split(',')[1];
      resolve(base64String || "");
    };
    reader.onerror = error => reject(error);
  });
}
