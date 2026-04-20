import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';

// IMPORTACIONES DE TUS COMPONENTES
import Header from './components/common/Header';
import Hero from './components/landing/Hero';
import AuditTool from './components/landing/AuditTool';
import ResultsOverview from './components/dashboard/ResultsOverview';
import HistoryView from './components/dashboard/HistoryView';
import PaymentModal from './components/modals/PaymentModal';

// PROBAMOS CON LA RUTA MÁS COMÚN (Si falla, revisá tu carpeta 'contexts')
import { LanguageProvider } from './contexts/LanguageContext'; 

function MainApp() {
  const [url, setUrl] = useState('');
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'success' || localStorage.getItem('audit_premium') === 'true') {
      setIsUnlocked(true);
      localStorage.setItem('audit_premium', 'true');
      if (params.get('status') === 'success') window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const handleAudit = async (source: string | File) => {
    setIsAuditing(true);
    setResult(null);
    setError(null);
    setActiveView('audit');
    try {
      // Simulamos la llamada a Gemini para evitar errores si runAudit no está global
      console.log("Analizando:", source);
      // Aquí deberías tener tu lógica de runAudit(source)
    } catch (err) {
      setError("Error en la conexión con el motor de IA.");
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
                  <div className="bg-white rounded-3xl h-full flex flex-col items-center justify-center p-12 text-center">
                    <Shield size={40} className="animate-pulse text-blue-600" />
                    <h2 className="text-2xl font-black mt-4">Escaneando...</h2>
                  </div>
                ) : result ? (
                  <ResultsOverview result={result} isUnlocked={isUnlocked} onExport={() => setIsPaymentOpen(true)} />
                ) : (
                  <div className="bg-white rounded-3xl h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-100">
                    <h3 className="text-xl font-black text-slate-400">Listo para empezar</h3>
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

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
