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

    // Simulamos proceso profundo de IA
    setTimeout(() => {
      const mockResult = {
        score: 85,
        findings: [
          { 
            id: 1, 
            level: 'critical', 
            color: 'red', // <--- Agregamos el color explícito para que no rompa
            title: 'Privacidad y Datos Biométricos', 
            description: 'TikTok recolecta patrones de voz y faciales. En Argentina, esto requiere un consentimiento explícito que no está claramente detallado.' 
          },
          { 
            id: 2, 
            level: 'warning', 
            color: 'amber',
            title: 'Jurisdicción y Ley Aplicable', 
            description: 'La política menciona tribunales de Singapur, lo cual puede ser abusivo para consumidores argentinos.' 
          }
        ],
        summary: `Análisis exhaustivo finalizado para: ${typeof source === 'string' ? 'Política de TikTok' : source.name}.`,
        iaTraining: true,
        jurisdiction: "MENDOZA / ARGENTINA",
        details: {
          complexity: "Alta",
          timestamp: new Date().toLocaleTimeString()
        }
      };

      setResult(mockResult);
      setHistory(prev => [mockResult, ...prev]);
      setIsAuditing(false);
    }, 3000);
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
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <AuditTool onAudit={handleAudit} isAuditing={isAuditing} />
              </div>
            </div>

            <div className="col-span-12 xl:col-span-8">
              <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
                <ResultsOverview 
                  result={result} 
                  onReset={() => setResult(null)} 
                  userTier="Free"
                  onExport={() => alert('Exportando reporte...')}
                />
              </div>
            </div>
          </div>
        ) : activeView === 'history' ? (
          <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
            <HistoryView history={history} onSelectResult={(res: any) => {
              setResult(res);
              setActiveView('audit');
            }} />
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
