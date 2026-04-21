import React, { useState } from 'react';
import Header from './components/common/Header';
import Hero from './components/landing/Hero';
import AuditTool from './components/landing/AuditTool';
import ResultsOverview from './components/dashboard/ResultsOverview';
import HistoryView from './components/dashboard/HistoryView';
import SettingsView from './components/dashboard/SettingsView';

function App() {
  const [activeView, setActiveView] = useState('audit');
  const [isAuditing, setIsAuditing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const handleAudit = async (source: string | File) => {
    setIsAuditing(true);
    setResult(null);

    setTimeout(() => {
      const mockResult = {
        score: 64, // Un puntaje más realista (con riesgo)
        findings: [
          { 
            id: 1, level: 'critical', color: 'red',
            title: 'Recolección de Biometría No Consentida', 
            description: 'TikTok procesa huellas faciales y de voz. La política no cumple con el estándar de consentimiento explícito de la Ley 25.326 de Argentina.' 
          },
          { 
            id: 2, level: 'critical', color: 'red',
            title: 'Acceso de Terceros a Datos Sensibles', 
            description: 'Se detectaron cláusulas que permiten compartir perfiles de comportamiento con entidades en jurisdicciones sin convenios de adecuación.' 
          },
          { 
            id: 3, level: 'warning', color: 'amber',
            title: 'Jurisdicción Internacional Abusiva', 
            description: 'Obligar a un usuario argentino a litigar en Singapur se considera una cláusula leonina en términos de defensa del consumidor.' 
          },
          { 
            id: 4, level: 'info', color: 'blue',
            title: 'Uso de Algoritmos de Recomendación', 
            description: 'La política detalla el uso de IA para personalización, lo cual es transparente, aunque requiere monitoreo de sesgos.' 
          }
        ],
        summary: `AUDITORÍA NIVEL ENTERPRISE: El documento analizado (${typeof source === 'string' ? 'URL TikTok' : source.name}) presenta fallas críticas de cumplimiento normativo. Se recomienda la remediación inmediata de las cláusulas de privacidad biométrica para evitar multas de la AAIP.`,
        iaTraining: true,
        jurisdiction: "MENDOZA / LATAM / GLOBAL",
        details: {
          complexity: "Nivel de Complejidad: Muy Alta",
          riskLevel: "Riesgo Legal: Elevado",
          wordCount: "Análisis de 4,250 tokens finalizado",
          timestamp: new Date().toLocaleString('es-AR')
        }
      };

      setResult(mockResult);
      setHistory(prev => [mockResult, ...prev]);
      setIsAuditing(false);
    }, 3500); // Un poco más de carga para dar sensación de análisis profundo
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100">
      <Header onViewChange={setActiveView} />
      
      <main className="max-w-7xl mx-auto pt-32 pb-20 px-4">
        {activeView === 'audit' ? (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 xl:col-span-4 space-y-8">
              <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                <Hero />
              </div>
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-blue-900/5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <AuditTool onAudit={handleAudit} isAuditing={isAuditing} />
              </div>
            </div>

            <div className="col-span-12 xl:col-span-8 h-full">
              <ResultsOverview 
                result={result} 
                onReset={() => setResult(null)} 
                userTier="Free"
                onExport={() => alert('Generando Reporte PDF Enterprise...')}
              />
            </div>
          </div>
        ) : activeView === 'history' ? (
          <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
            <HistoryView history={history} onSelectResult={(res: any) => { setResult(res); setActiveView('audit'); }} />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-top-4 duration-500">
            <SettingsView />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
