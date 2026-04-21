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
    // Simulamos proceso de IA
    setTimeout(() => {
      const mockResult = {
        score: 85,
        findings: [
          { id: 1, level: 'critical', title: 'Privacidad', description: 'Riesgo alto en manejo de datos.' },
          { id: 2, level: 'warning', title: 'Jurisdicción', description: 'Cláusulas fuera de Argentina.' }
        ],
        summary: "Análisis completado exitosamente para: " + (typeof source === 'string' ? source : 'Archivo'),
        iaTraining: true,
        jurisdiction: "Mendoza"
      };
      setResult(mockResult);
      setHistory(prev => [mockResult, ...prev]);
      setIsAuditing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onViewChange={setActiveView} />
      <main className="max-w-7xl mx-auto pt-32 pb-20 px-4">
        {activeView === 'audit' ? (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 xl:col-span-4 space-y-8">
              <Hero />
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
                <AuditTool onAudit={handleAudit} isAuditing={isAuditing} />
              </div>
            </div>
            <div className="col-span-12 xl:col-span-8">
              <ResultsOverview result={result} onReset={() => setResult(null)} />
            </div>
          </div>
        ) : activeView === 'history' ? (
          <HistoryView history={history} onSelectResult={setResult} />
        ) : (
          <SettingsView />
        )}
      </main>
    </div>
  );
}

export default App;
