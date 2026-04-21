import React, { useState, useEffect } from 'react';
import Header from './components/common/Header';
import Hero from './components/landing/Hero';
import AuditTool from './components/landing/AuditTool';
import ResultsOverview from './components/dashboard/ResultsOverview';
import HistoryView from './components/dashboard/HistoryView';
import SettingsView from './components/dashboard/SettingsView';
import PaymentModal from './components/modals/PaymentModal';

function App() {
  const [activeView, setActiveView] = useState('audit');
  const [isAuditing, setIsAuditing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [userTier, setUserTier] = useState('Free');

  // Recuperar estado premium al cargar
  useEffect(() => {
    const isPro = localStorage.getItem('audit_premium') === 'true';
    if (isPro) setUserTier('Pro');
  }, []);

  const handlePaymentSuccess = () => {
    setUserTier('Pro');
    setIsPaymentOpen(false);
    localStorage.setItem('audit_premium', 'true');
  };

  const handleAudit = async (source: string | File) => {
    setIsAuditing(true);
    setResult(null);
    setTimeout(() => {
      const mockResult = {
        score: 64,
        findings: [
          { id: 1, level: 'critical', color: 'red', title: 'Recolección de Biometría', description: 'Se detectó procesamiento de huellas faciales sin consentimiento explícito según Ley 25.326.' },
          { id: 2, level: 'critical', color: 'red', title: 'Transferencia a Terceros', description: 'Los datos se comparten con entidades fuera de jurisdicción segura.' },
          { id: 3, level: 'warning', color: 'amber', title: 'Jurisdicción Abusiva', description: 'Cláusula de litigio en el extranjero detectada.' }
        ],
        summary: "Auditoría finalizada. Riesgos detectados en materia de privacidad y biometría.",
        iaTraining: true,
        jurisdiction: "MENDOZA / ARGENTINA",
        details: { complexity: "Alta", timestamp: new Date().toLocaleString('es-AR') }
      };
      setResult(mockResult);
      setHistory(prev => [mockResult, ...prev]);
      setIsAuditing(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onViewChange={setActiveView} />
      
      <main className="max-w-7xl mx-auto pt-32 pb-20 px-4">
        {activeView === 'audit' ? (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 xl:col-span-4 space-y-8">
              <Hero />
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl">
                <AuditTool onAudit={handleAudit} isAuditing={isAuditing} />
              </div>
            </div>

            <div className="col-span-12 xl:col-span-8">
              {!isAuditing && result ? (
                <ResultsOverview 
                  result={result} 
                  onReset={() => setResult(null)} 
                  userTier={userTier} 
                  onExport={() => userTier === 'Pro' ? alert('Generando PDF...') : setIsPaymentOpen(true)}
                />
              ) : isAuditing ? (
                <div className="h-[500px] flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-300">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-slate-500 font-bold animate-pulse">Analizando política legal...</p>
                </div>
              ) : (
                <div className="h-[500px] flex items-center justify-center bg-white/50 rounded-3xl border border-dashed border-slate-200 text-slate-400 font-medium">
                   Esperando análisis legal...
                </div>
              )}
            </div>
          </div>
        ) : activeView === 'history' ? (
          <HistoryView history={history} onSelectResult={(res: any) => { setResult(res); setActiveView('audit'); }} />
        ) : (
          <SettingsView />
        )}
      </main>

      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
        onSuccess={handlePaymentSuccess} 
      />
    </div>
  );
}

export default App;
