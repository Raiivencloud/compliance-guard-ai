import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, History, Search } from 'lucide-react';

// IMPORTACIONES SEGÚN TU ESTRUCTURA REAL (image_664d26.png)
import Header from './components/common/Header';
import Hero from './components/landing/Hero';
import AuditTool from './components/landing/AuditTool';
import ResultsOverview from './components/dashboard/ResultsOverview';
import HistoryView from './components/dashboard/HistoryView';
import PaymentModal from './components/modals/PaymentModal';

// Importamos tu servicio de IA
import { runAudit } from './services/geminiAudit';

function MainApp() {
  const [result, setResult] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'audit' | 'history'>('audit');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [userTier, setUserTier] = useState<'Free' | 'Pro'>(() => {
    return (localStorage.getItem('user_tier') as 'Free' | 'Pro') || 'Free';
  });

  // Lógica para detectar el pago de Mercado Pago / PayPal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const hasAccess = localStorage.getItem('audit_premium') === 'true';

    if (status === 'success' || hasAccess) {
      setIsUnlocked(true);
      localStorage.setItem('audit_premium', 'true');
      if (status === 'success') {
        window.history.replaceState({}, document.title, "/");
      }
    }
  }, []);

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
      setError("Error de conexión con el motor de IA. Reintentá en unos segundos.");
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-100">
      <Header 
        activeView={activeView} 
        onViewChange={setActiveView}
        isLoggedIn={isLoggedIn}
        userTier={userTier}
        onLogin={() => setIsLoggedIn(true)}
        onLogout={() => { setIsLoggedIn(false); setUserTier('Free'); }}
      />

      <main className="flex-1 grid grid-cols-12 gap-8 p-8 mt-16 max-w-[1600px] mx-auto w-full">
        <div className="col-span-12 xl:col-span-4 space-y-8">
          <Hero />
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden">
            <AuditTool onAudit={handleAudit} isAuditing={isAuditing} />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-8">
          <AnimatePresence mode="wait">
            {activeView === 'audit' ? (
              <motion.div key="audit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                {isAuditing ? (
                  <div className="bg-white rounded-3xl h-[450px] flex flex-col items-center justify-center p-12 text-center">
                    <Shield size={48} className="animate-pulse text-blue-600 mb-4" />
                    <h2 className="text-2xl font-black">Escaneando Protocolos...</h2>
                    <p className="text-slate-500 mt-2">La IA de ComplianceGuard está analizando la cuenta.</p>
                  </div>
                ) : result ? (
                  <ResultsOverview 
                    result={result} 
                    isUnlocked={isUnlocked} 
                    onExport={() => setIsPaymentOpen(true)}
                    userTier={userTier}
                  />
                ) : (
                  <div className="bg-white rounded-3xl h-[450px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
                    <Search size={48} className="text-slate-300 mb-4" />
                    <p className="text-slate-400 font-medium">Ingresá una URL de TikTok para comenzar</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <HistoryView history={history} onSelectResult={(res) => { setResult(res); setActiveView('audit'); }} />
            )}
          </AnimatePresence>
        </div>
      </main>

      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />
    </div>
  );
}

// EXPORTACIÓN SIMPLE PARA EVITAR ERRORES DE CONTEXTO
export default function App() {
  return <MainApp />;
}
