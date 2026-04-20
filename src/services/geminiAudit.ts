import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AuditResult, AuditFinding, RiskLevel } from "../types";
// ... resto del código ...
const SYSTEM_INSTRUCTION = `Eres 'ComplianceGuard Engine', una IA especializada en derecho digital y seguridad de la información. Tu tarea es analizar Términos y Condiciones y Políticas de Privacidad de servicios de IA.
Tu salida debe ser exclusivamente un objeto JSON con la siguiente estructura:
{
"score": (número del 1 al 100, donde 100 es seguro),
"resumen": "string corto",
"hallazgos": [
{
"prioridad": "alta|media|baja",
"clausula": "título de la cláusula",
"descripcion": "explicación simple del riesgo",
"recomendacion": "qué debe hacer la empresa"
}
],
"entrenamiento_ia": (booleano: ¿usan datos para entrenar?),
"jurisdiccion": "país/región legal"
}

Reglas críticas:
1. Optimización de velocidad: Enfócate exclusivamente en las secciones de 'Uso de Datos' (Data Usage), 'Privacidad' (Privacy) y 'Entrenamiento de Modelos'. Ignora completamente secciones de facturación, reembolsos, soporte técnico o niveles de servicio.
2. Formato: Genera solo el JSON. No cites leyes extensamente, usa descripciones ejecutivas y directas.
3. Validación: Si el texto no es una política de privacidad, devuelve: {"error": "Documento no válido."}
4. Criterio: Sé extremadamente pesimista; ante la duda, prioridad alta.`;

const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export async function runAudit(source: string | File): Promise<AuditResult> {
  const PRIMARY_MODEL = "gemini-3.1-pro-preview";
  const FALLBACK_MODEL = "gemini-3-flash-preview";
  if (typeof source === 'string') {
    content = { text: `Analiza las secciones de Privacidad y Uso de Datos de este servicio: ${source}. Prioriza la detección de uso de datos para entrenamiento de IA.` };
  } else {
    const base64Data = await fileToBase64(source);
    content = {
      parts: [
        { inlineData: { data: base64Data, mimeType: source.type } },
        { text: "Analiza exclusivamente las cláusulas de Privacidad, Uso de Datos y Entrenamiento de Modelos en este documento. Ignora el resto para optimizar latencia." }
      ]
    };
  }

  const performAudit = async (modelName: string) => {
    return await ai.models.generateContent({
      model: modelName,
      contents: content,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      }
    });
  };

  try {
    let response;
    try {
      response = await performAudit(PRIMARY_MODEL);
    } catch (primaryError: any) {
      // Check if it's a 503 or quota error to trigger fallback
      const errorStr = JSON.stringify(primaryError);
      if (errorStr.includes('503') || errorStr.includes('high demand') || errorStr.includes('429')) {
        console.warn(`Primary model (${PRIMARY_MODEL}) unavailable. Falling back to ${FALLBACK_MODEL}...`);
        response = await performAudit(FALLBACK_MODEL);
      } else {
        throw primaryError;
      }
    }

    const rawJson = JSON.parse(response.text || "{}");

    if (rawJson.error) {
      return {
        score: 0,
        summary: rawJson.error,
        findings: [],
        iaTraining: false,
        jurisdiction: "Unknown",
        timestamp: new Date().toISOString(),
        error: rawJson.error
      };
    }

    // Mapping priorities to RiskLevel
    const mapLevel = (prio: string): RiskLevel => {
      if (prio === 'alta') return 'critical';
      if (prio === 'media') return 'warning';
      return 'safe';
    };

    const findings: AuditFinding[] = (rawJson?.hallazgos || []).map((h: any, i: number) => ({
      id: `${Date.now()}-${i}`,
      category: h.prioridad === 'alta' ? 'Compliance' : 'Governance',
      title: h.clausula || 'Sin título',
      description: h.descripcion || 'Sin descripción',
      level: mapLevel(h.prioridad),
      recommendation: h.recommendation || h.recomendacion || 'Sin recomendación'
    }));

    return {
      score: rawJson.score,
      summary: rawJson.resumen,
      findings,
      iaTraining: rawJson.entrenamiento_ia,
      jurisdiction: rawJson.jurisdiccion,
      timestamp: new Date().toISOString(),
      url: typeof source === 'string' ? source : undefined,
      fileName: source instanceof File ? source.name : undefined
    };
  } catch (error) {
    console.error("Gemini Audit Error:", error);
    throw new Error("Error procesando la auditoría con ComplianceGuard Engine.");
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
