import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Globe } from 'lucide-react';
import Header from './components/common/Header';
import Hero from './components/landing/Hero';
import AuditTool from './components/landing/AuditTool';
import ResultsOverview from './components/dashboard/ResultsOverview';
import HistoryView from './components/dashboard/HistoryView';
import PolicyEngineView from './components/dashboard/PolicyEngineView';
import IntegrationsView from './components/dashboard/IntegrationsView';
import PaymentModal from './components/modals/PaymentModal';
export default function App() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'remediation'>('overview');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [userTier, setUserTier] = useState<'free' | 'pro'>(() => {
    return (localStorage.getItem('user_tier') as 'free' | 'pro') || 'free';
  });

  // 1. Efecto para detectar el pago y desbloquear
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const plan = params.get('plan');
    const hasAccess = localStorage.getItem('audit_premium') === 'true';

    if (status === 'success' || hasAccess) {
      setIsUnlocked(true);
      localStorage.setItem('audit_premium', 'true');
      
      if (plan === 'pro') {
        localStorage.setItem('user_tier', 'pro');
        setUserTier('pro');
      }

      if (status === 'success') {
        window.history.replaceState({}, document.title, "/");
        alert("¡Acceso verificado! Informe desbloqueado.");
      }
    }
  }, []);

  // 2. Función para ejecutar la auditoría
  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setIsLoading(true);
    try {
      // Aquí llama a tu función de Gemini (analyzeCompliance o similar)
      const response = await analyzeCompliance(url); 
      setResult(response);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al analizar la URL. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
    setActiveView('audit');
    
    try {
      const auditResult = await runAudit(source);
      setResult(auditResult);
      setHistory(prev => [auditResult, ...prev]);
    } catch (err: any) {
      console.error(err);
      let message = 'Audit Protocol Error: Secure connection interrupted.';
      if (err.message?.includes('503') || err.message?.includes('high demand')) {
        message = 'Engine Overload: High demand detected. Our primary nodes are saturated. Retrying with secondary infrastructure...';
      } else if (err.message?.includes('API key')) {
        message = 'Authentication Error: ComplianceGuard Engine credentials invalid.';
      }
      setError(message);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSelectHistory = (selected: AuditResult) => {
    setResult(selected);
    setActiveView('audit');
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    // Simulating a random tier assignment for demo purposes
    // In a real app, this would come from a verified DB check
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-100 transition-colors duration-300">
      <Header 
        activeView={activeView} 
        onViewChange={setActiveView} 
        isLoggedIn={isLoggedIn}
        userTier={userTier}
        onLogin={handleLogin}
        onLogout={() => { setIsLoggedIn(false); setUserTier('Free'); }}
      />
      
      <main className="flex-1 grid grid-cols-12 gap-8 p-8 overflow-hidden mt-16 max-w-[1600px] mx-auto w-full">
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-8">
          <AnimatePresence mode="wait">
            <motion.div
              key="audit-interaction"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <Hero />
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 transition-opacity group-hover:opacity-100" />
                <AuditTool onAudit={handleAudit} isAuditing={isAuditing} />
              </div>
              
              <div className="bg-slate-900 rounded-3xl p-8 text-white flex justify-between items-center shadow-2xl group hover:bg-slate-800 transition-all cursor-pointer relative overflow-hidden active:scale-[0.98]" onClick={() => setActiveView('history')}>
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest flex items-center gap-2 mb-2">
                    <Globe size={12} /> Recent Scanning Status
                  </p>
                  <p className="text-xl font-black truncate max-w-[200px] tracking-tight">
                    {history[0]?.url || history[0]?.fileName || 'No active scans'}
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    {history[0] ? new Date(history[0].timestamp).toLocaleTimeString() : 'Initialize protocol to start'}
                  </p>
                </div>
                <div className="text-right relative z-10">
                  <span className={`block text-[10px] font-black uppercase tracking-widest mb-1 ${history[0] ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {history[0] ? 'STATUS: NOMINAL' : 'STATUS: IDLE'}
                  </span>
                  <span className="text-3xl font-black">{history[0]?.score || '00'}<span className="text-sm opacity-50">%</span></span>
                </div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl -mr-12 -mb-12" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="col-span-12 xl:col-span-8">
          <AnimatePresence mode="wait">
            {activeView === 'audit' && (
              <motion.div key="audit-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                {isAuditing ? (
                  <div className="bg-white rounded-3xl border border-slate-200 h-full flex flex-col items-center justify-center p-12 text-center text-slate-900">
                    <div className="relative w-24 h-24 mb-10">
                      <motion.div
                        className="absolute inset-0 border-t-4 border-blue-600 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Shield size={40} className="text-blue-600" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Análisis en Progreso</h2>
                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest animate-pulse">ComplianceGuard Engine: Mapping Data Protocols...</p>
                  </div>
                ) : error ? (
                  <div className="bg-white rounded-3xl border border-red-200 h-full flex flex-col items-center justify-center p-12 text-center bg-red-50/10">
                    <div className="w-20 h-20 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mb-8 shadow-sm">
                      <Shield size={36} />
                    </div>
                    <h3 className="text-xl font-black text-red-900">Error de Auditoría</h3>
                    <p className="text-sm text-red-700 max-w-xs mt-3 font-medium leading-relaxed">{error}</p>
                    <button 
                      onClick={() => setError(null)}
                      className="mt-10 px-8 py-3 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                    >
                      Regresar al Inicio
                    </button>
                  </div>
                ) : result ? (
                  <ResultsOverview 
                    result={result}
                    isUnlocked={isUnlocked} //
                    onReset={() => setResult(null)} 
                    onExport={() => setIsPaymentOpen(true)}
                    userTier={userTier}
                    isPaymentPending={isPaymentPending}
                  />
                ) : (
                  <div className="bg-white rounded-3xl h-full flex flex-col items-center justify-center p-12 text-center border-2 border-slate-100 border-dashed bg-slate-50/30">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-8">
                      <Shield size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest mb-2">Central de Operaciones</h3>
                    <p className="text-sm text-slate-400 max-w-xs font-medium leading-relaxed">Inicia un escaneo para ver los resultados detallados y las recomendaciones de cumplimiento.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeView === 'history' && (
              <motion.div key="history-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                <HistoryView history={history} onSelectResult={handleSelectHistory} />
              </motion.div>
            )}

            {activeView === 'policy' && (
              <motion.div key="policy-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                <PolicyEngineView />
              </motion.div>
            )}

            {activeView === 'integrations' && (
              <motion.div key="integrations-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                <IntegrationsView />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="bg-white px-10 py-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 font-black uppercase tracking-widest shrink-0 gap-6">
        <div className="flex items-center gap-6">
          <span className="text-blue-600 font-black tracking-widest">RaiivenCloud Intelligence</span>
          <div className="hidden sm:block w-px h-4 bg-slate-200" />
          <span className="whitespace-nowrap font-bold opacity-80">Secure Payments by RaiivenCloud Financial Services</span>
        </div>
        <div className="flex gap-8 items-center">
          <div className="flex gap-3">
            <span className="flex items-center gap-2 border border-slate-200 px-3 py-1.5 rounded-lg bg-slate-50 shadow-sm"><Shield size={10} className="text-blue-500" /> SOC2 TYPE II</span>
            <span className="flex items-center gap-2 border border-slate-200 px-3 py-1.5 rounded-lg bg-slate-50 shadow-sm"><Lock size={10} className="text-blue-500" /> FIPS 140-2</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-slate-200" />
          <span className="font-bold opacity-80">v4.1.0-ENTERPRISE</span>
          <div className="hidden sm:block w-px h-4 bg-slate-200" />
          <span className="font-bold opacity-80">© 2026 ComplianceGuard AI</span>
        </div>
      </footer>

      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)}
        onUpgrade={() => {
          setUserTier('Pro');
          setIsPaymentPending(false);
          setIsPaymentOpen(false);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}


