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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const isPro = localStorage.getItem('audit_premium') === 'true';
    const session = localStorage.getItem('user_session') === 'true';
    if (isPro) setUserTier('Pro');
    if (session) setIsLoggedIn(true);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('user_session', 'true');
    alert('Sesión iniciada correctamente.');
  };

  const handlePaymentSuccess = () => {
    const code = prompt("Ingresá el código de activación que recibiste por WhatsApp:");
    if (code?.toUpperCase() === 'RAIIVEN') {
      setUserTier('Pro');
      localStorage.setItem('audit_premium', 'true');
      setIsPaymentOpen(false);
      alert('¡Acceso PRO activado exitosamente!');
    } else if (code !== null) {
      alert('Código incorrecto. Por favor, verificá con soporte.');
    }
  };

  const handleAudit = async (source: string | File) => {
    setIsAuditing(true);
    setResult(null);
    setTimeout(() => {
      const mockResult = {
        score: 64,
        findings: [
          { id: 1, level: 'critical', color: 'red', title: 'Recolección de Biometría', description: 'TikTok recolecta huellas faciales y de voz sin consentimiento explícito según Ley 25.326.' },
          { id: 2, level: 'critical', color: 'red', title: 'Transferencia a Terceros', description: 'Se detectó envío de datos a servidores fuera de jurisdicción segura.' },
          { id: 3, level: 'warning', color: 'amber', title: 'Jurisdicción Abusiva', description: 'La política impone tribunales extranjeros.' }
        ],
        summary: "Auditoría finalizada. Riesgos críticos detectados.",
        iaTraining: true,
        jurisdiction: "MENDOZA / ARGENTINA",
        details: { complexity: "Muy Alta", timestamp: new Date().toLocaleString('es-AR') }
      };
      setResult(mockResult);
      setHistory(prev => [mockResult, ...prev]);
      setIsAuditing(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onViewChange={setActiveView} isLoggedIn={isLoggedIn} onLogin={handleLogin} />
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
                  onExport={() => userTier === 'Pro' ? window.print() : setIsPaymentOpen(true)}
                />
              ) : isAuditing ? (
                <div className="h-[500px] flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-slate-300">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-slate-500 font-bold animate-pulse">Analizando...</p>
                </div>
              ) : (
                <div className="h-[500px] flex items-center justify-center bg-white/50 rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400">
                   Esperando documento...
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
      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} onSuccess={handlePaymentSuccess} />
    </div>
  );
}

export default App;
