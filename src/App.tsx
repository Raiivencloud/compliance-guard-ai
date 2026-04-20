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
  const [isAuditing, setIsAuditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'audit' | 'history' | 'policy' | 'integrations'>('audit');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isPaymentPending, setIsPaymentPending] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [userTier, setUserTier] = useState<'Free' | 'Pro'>(() => {
    return (localStorage.getItem('user_tier') as 'Free' | 'Pro') || 'Free';
  });
  // 1. Efecto para detectar el pago y desbloquear (Mercado Pago / PayPal)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const plan = params.get('plan');
    const hasAccess = localStorage.getItem('audit_premium') === 'true';

    if (status === 'success' || hasAccess) {
      setIsUnlocked(true);
      localStorage.setItem('audit_premium', 'true');
      
      if (plan === 'pro' || plan === 'pro_monthly') {
        localStorage.setItem('user_tier', 'Pro');
        setUserTier('Pro');
      }

      if (status === 'success') {
        window.history.replaceState({}, document.title, "/");
      }
    }
  }, []);

  // 2. Función de Login que el Header está pidiendo
  const handleLogin = () => {
    setIsLoggedIn(true);
    setUserTier('Pro'); // O 'Free' según prefieras por defecto
  };
const handleAudit = async (source: string | File) => {
    setIsAuditing(true);
    setResult(null);
    setError(null);
    setActiveView('audit');

    try {
      const auditResult = await runAudit(source);
      setResult(auditResult);
      setHistory(prev => [auditResult, ...prev]);
    } catch (err: any) {
      console.error(err);
      let message = 'Audit Protocol Error: Secure connection interrupted.';
      if (err.message?.includes('503') || err.message?.includes('high demand')) {
        message = 'Engine Overload: High demand detected. Our primary nodes are saturated.';
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
            <motion.div key="audit-interaction" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <Hero />
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
                <AuditTool onAudit={handleAudit} isAuditing={isAuditing} />
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
                     <Shield size={40} className="animate-pulse text-blue-600" />
                     <h2 className="text-2xl font-black mt-4">Análisis en Progreso...</h2>
                  </div>
                ) : error ? (
                  <div className="bg-white rounded-3xl border border-red-200 h-full flex flex-col items-center justify-center p-12 text-center">
                    <h3 className="text-xl font-black text-red-900">Error de Auditoría</h3>
                    <p className="text-sm text-red-700 mt-2">{error}</p>
                    <button onClick={() => setError(null)} className="mt-6 px-8 py-3 bg-red-600 text-white rounded-xl">Reintentar</button>
                  </div>
                ) : result ? (
                  <ResultsOverview 
                    result={result} 
                    isUnlocked={isUnlocked}
                    onReset={() => setResult(null)}
                    onExport={() => setIsPaymentOpen(true)}
                    userTier={userTier}
                    isPaymentPending={isPaymentPending}
                  />
                ) : (
                  <div className="bg-white rounded-3xl h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-100">
                    <Shield size={40} className="text-slate-300" />
                    <h3 className="text-xl font-black text-slate-400 mt-4">Central de Operaciones</h3>
                    <p className="text-sm text-slate-400">Inicia un escaneo para ver los resultados.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeView === 'history' && (
              <motion.div key="history-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                <HistoryView history={history} onSelectResult={handleSelectHistory} />
              </motion.div>
            )}
            {/* ... aquí podrías agregar los otros views (policy/integrations) si los usas */}
          </AnimatePresence>
        </div>
      </main>

      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
        onUpgrade={() => { setUserTier('Pro'); setIsPaymentOpen(false); }}
      />
    </div>
  );
}
