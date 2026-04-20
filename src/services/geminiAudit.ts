import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AuditResult, AuditFinding, RiskLevel } from "../types";

const SYSTEM_INSTRUCTION = `Eres 'ComplianceGuard Engine', una IA especializada en auditoría legal de términos de servicio y políticas de privacidad.
Tu objetivo es analizar textos legales o documentos y devolver un objeto JSON estricto con la siguiente estructura:
{
  "score": número del 0 al 100,
  "hallazgos": [
    {
      "clausula": "nombre de la sección",
      "descripcion": "explicación del riesgo",
      "prioridad": "alta" | "media" | "baja",
      "recomendacion": "qué debería hacer el usuario"
    }
  ]
}`;

const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
}

export async function runAudit(source: string | File): Promise<AuditResult> {
  const PRIMARY_MODEL = "gemini-1.5-pro"; 
  const FALLBACK_MODEL = "gemini-1.5-flash";
  
  let content: any;

  // Preparamos el contenido según sea texto o archivo
  if (typeof source === 'string') {
    content = { text: `Analiza este servicio: ${source}. Busca cláusulas abusivas y uso de datos para IA.` };
  } else {
    const base64Data = await fileToBase64(source);
    content = {
      inlineData: { 
        data: base64Data, 
        mimeType: source.type 
      }
    };
  }

  const performAudit = async (modelName: string) => {
    const model = ai.getGenerativeModel({ 
      model: modelName,
      systemInstruction: SYSTEM_INSTRUCTION 
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [content] }], 
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    return result.response;
  };

  try {
    let response;
    try {
      response = await performAudit(PRIMARY_MODEL);
    } catch (error) {
      console.warn("Modelo primario falló o no disponible, usando fallback...");
      response = await performAudit(FALLBACK_MODEL);
    }

    const rawJson = JSON.parse(response.text());
    
    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      serviceName: typeof source === 'string' ? "Análisis de Texto/URL" : source.name,
      score: rawJson.score || 0,
      status: (rawJson.score || 0) > 70 ? 'pass' : (rawJson.score || 0) > 40 ? 'warning' : 'fail',
      findings: (rawJson.hallazgos || []).map((h: any) => ({
        id: crypto.randomUUID(),
        category: h.prioridad === 'alta' ? 'Compliance' : 'Governance',
        title: h.clausula || 'Cláusula analizada',
        description: h.descripcion || 'Sin descripción disponible',
        level: h.prioridad === 'alta' ? 'critical' : h.prioridad === 'media' ? 'warning' : 'safe',
        recommendation: h.recomendacion || 'Revisar con un profesional legal.'
      }))
    };
  } catch (error) {
    console.error("Error crítico en la auditoría:", error);
    throw error;
  }
}
