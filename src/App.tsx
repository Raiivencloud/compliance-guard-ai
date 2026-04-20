import { useState, useEffect, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, Globe } from 'lucide-react';

// IMPORTACIONES DE TUS COMPONENTES
import Header from './components/common/Header';
import Hero from './components/landing/Hero';
import AuditTool from './components/landing/AuditTool';
import ResultsOverview from './components/dashboard/ResultsOverview';
import HistoryView from './components/dashboard/HistoryView';
import PaymentModal from './components/modals/PaymentModal';
import { runAudit } from './services/geminiAudit';

// ========================================================
// 🔥 NEUTRALIZADOR DE I18NEXT (Evita el error de image_6722dd.png)
// ========================================================
// @ts-ignore
window.useTranslation = () => ({ t: (key: string) => key, i18n: { changeLanguage: () => {} } });

// Definimos el contexto local para que el Header y otros no chillen
export const LanguageContext = createContext({ t: (key: string) => key });
const LanguageProvider = ({ children }: { children: React.ReactNode }) => (
  <LanguageContext.Provider value={{ t: (key: string) => key }}>{children}</LanguageContext.Provider>
);

function MainApp() {
  const [result, setResult] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'audit' | 'history'>('audit');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [userTier, setUserTier] = useState<'Free' | 'Pro'>(() => {
    return (localStorage.getItem('user_tier') as 'Free' | 'Pro') || 'Free';
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'success' || localStorage.getItem('audit_premium') === 'true') {
      setIsUnlocked(true);
      localStorage.setItem('audit_premium', 'true');
    }
  }, []);

  const handleAudit = async (source: string | File) => {
    setIsAuditing(true);
    setResult(null);
    try {
      const auditResult = await runAudit(source);
      setResult(auditResult);
      setHistory(prev => [auditResult, ...prev]);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header 
        activeView={activeView} 
        onViewChange={setActiveView}
        isLoggedIn={isLoggedIn}
        userTier={userTier}
        onLogin={() => setIsLoggedIn(true)}
        onLogout={() => setIsLoggedIn(false)}
      />

      <main className="flex-1 grid grid-cols-12 gap-8 p-8 mt-16 max-w-[1600px] mx-auto w-full">
        <div className="col-span-12 xl:col-span-4 space-y-8">
          <Hero />
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
            <AuditTool onAudit={handleAudit} isAuditing={isAuditing} />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-8">
          <AnimatePresence mode="wait">
            {activeView === 'audit' ? (
              <motion.div key="audit" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {isAuditing ? (
                  <div className="bg-white rounded-3xl h-[450px] flex flex-col items-center justify-center p-12 text-center">
                    <Shield size={48} className="animate-pulse text-blue-600 mb-4" />
                    <h2 className="text-2xl font-black text-slate-900">ComplianceGuard Analizando...</h2>
                  </div>
                ) : result ? (
                  <ResultsOverview 
                    result={result} 
                    isUnlocked={isUnlocked} 
                    onExport={() => setIsPaymentOpen(true)}
                    userTier={userTier}
                  />
                ) : (
                  <div className="bg-white rounded-3xl h-[450px] flex flex-col items-center justify-center border-2 border-dashed border-slate-100">
                    <Search size={48} className="text-slate-200 mb-4" />
                    <p className="text-slate-400 font-medium italic text-center">
                       Ingresá una URL de TikTok para comenzar el peritaje legal
                    </p>
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

// EXPORTACIÓN CON EL PROVIDER LOCAL
export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
