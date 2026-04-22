import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Globe, CheckCircle2, MessageCircle, Info } from 'lucide-react';
import Header from './components/common/Header';
import Hero from './components/landing/Hero';
import AuditTool from './components/landing/AuditTool';
import ResultsOverview from './components/dashboard/ResultsOverview';
import HistoryView from './components/dashboard/HistoryView';
import PolicyEngineView from './components/dashboard/PolicyEngineView';
import IntegrationsView from './components/dashboard/IntegrationsView';
import PaymentModal from './components/modals/PaymentModal';
import { runAudit } from './services/geminiAudit';
import { LanguageProvider, useTranslation } from './hooks/useTranslation';
import { auth, db, googleProvider, signInWithPopup, signOut, doc, getDoc, setDoc, onSnapshot, collection, addDoc, query, where, getDocs, orderBy } from './lib/firebase';
import type { AuditResult } from './types';

type View = 'audit' | 'history' | 'policy' | 'integrations';

const STATUS_MESSAGES = [
  'Iniciando motores de IA de Google...',
  'Analizando contra Ley 25.326 de Argentina...',
  'Cruzando datos con GDPR y EU AI Act...',
  'Evaluando cumplimiento de AAIP Biometría...',
  'Generando reporte legal y PDF...'
];

function MainApp() {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>('audit');
  const [history, setHistory] = useState<AuditResult[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userTier, setUserTier] = useState<'Free' | 'Pro'>('Free');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isPaymentPending, setIsPaymentPending] = useState(false);
  const [showPrintWarning, setShowPrintWarning] = useState(false);
  const [statusMessage, setStatusMessage] = useState(STATUS_MESSAGES[0]);
  
  const { t } = useTranslation();

  // Sync auth and user profile
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Sync with Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            isPro: false,
            tier: 'Free',
            updatedAt: new Date().toISOString()
          });
          setUserTier('Free');
        } else {
          const data = userSnap.data();
          setUserTier(data.tier || 'Free');
        }

        // Live updates for tier changes
        onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUserTier(doc.data().tier || 'Free');
          }
        });

        // Load History from Firestore (client-side sort to avoid composite index requirement)
        try {
          const auditsRef = collection(db, 'audits');
          const q = query(auditsRef, where('userId', '==', firebaseUser.uid));
          const querySnapshot = await getDocs(q);
          const loadedHistory = querySnapshot.docs
            .map(d => d.data() as AuditResult)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setHistory(loadedHistory);
        } catch (hErr) {
          console.error("History load error:", hErr);
        }

      } else {
        setUser(null);
        setUserTier('Free');
        setHistory([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Status Message Rotation
  useEffect(() => {
    let interval: any;
    if (isAuditing) {
      let index = 0;
      interval = setInterval(() => {
        index = (index + 1) % STATUS_MESSAGES.length;
        setStatusMessage(STATUS_MESSAGES[index]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAuditing]);

  const handleAudit = async (source: string | File) => {
    if (!user) {
      setError("Inicia sesión para realizar peritajes.");
      return;
    }

    setIsAuditing(true);
    setResult(null);
    setError(null);
    setActiveView('audit');
    
    try {
      const auditResult = await runAudit(source);
      setResult(auditResult);
      
      // Persist to Firestore - Filter undefined values
      const auditData = {
        ...auditResult,
        userId: user.uid,
        timestamp: new Date().toISOString()
      };

      // Firestore doesn't like 'undefined' values
      const cleanAuditData = Object.fromEntries(
        Object.entries(auditData).filter(([_, v]) => v !== undefined)
      );
      
      await addDoc(collection(db, 'audits'), cleanAuditData);
      setHistory(prev => [auditData, ...prev]);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Audit Protocol Error.');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
       console.error("Logout failed", error);
    }
  };

  const handleExport = () => {
    if (userTier === 'Pro') {
      try {
        window.print();
        // Show a helpful tip for the preview environment
        setShowPrintWarning(true);
        setTimeout(() => setShowPrintWarning(false), 8000);
      } catch (err) {
        console.error("Print error:", err);
        setShowPrintWarning(true);
      }
    } else {
      setIsPaymentOpen(true);
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
        isLoggedIn={!!user}
        userTier={userTier}
        onLogin={handleLogin}
        onLogout={handleLogout}
        user={user}
      />
      
      <main className="flex-1 grid grid-cols-12 gap-8 p-8 overflow-hidden mt-16 max-w-[1600px] mx-auto w-full">
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-8 no-print">
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
              
              <div 
                className="bg-slate-900 rounded-3xl p-8 text-white flex justify-between items-center shadow-2xl group hover:bg-slate-800 transition-all cursor-pointer relative overflow-hidden active:scale-[0.98]" 
                onClick={() => setActiveView('history')}
              >
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

        <div className="col-span-12 xl:col-span-8 print:col-span-12">
          <AnimatePresence mode="wait">
            {activeView === 'audit' && (
              <motion.div key="audit-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                {isAuditing ? (
                  <div className="bg-white rounded-3xl border border-slate-200 h-full flex flex-col items-center justify-center p-12 text-center text-slate-900 shadow-sm">
                    <div className="relative w-32 h-32 mb-12">
                      <motion.div
                        className="absolute inset-0 border-t-4 border-blue-600 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <motion.div
                        className="absolute inset-4 border-t-4 border-emerald-500 rounded-full"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Shield size={48} className="text-blue-600 animate-pulse" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">ComplianceGuard Engine</h2>
                    <div className="space-y-2">
                       <p className="text-slate-900 font-black text-sm uppercase tracking-widest">{statusMessage}</p>
                       <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] animate-pulse">Mapping Data Protocols & Legal Anchors...</p>
                    </div>
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
                    onReset={() => setResult(null)} 
                    onExport={handleExport}
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

      <footer className="bg-white px-10 py-10 border-t border-slate-200 no-print">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
               <Shield size={24} className="fill-blue-600/10" />
               <span className="font-black text-lg tracking-tight">ComplianceGuard AI</span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed pr-8">
              La plataforma líder en peritajes de IA y cumplimiento normativo. 
              Garantizamos el secreto comercial y la privacidad de los textos analizados.
            </p>
          </div>
          
          <div className="space-y-6">
            <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Confianza & Seguridad</h5>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-2 px-3 border border-slate-100 rounded-xl bg-slate-50 shadow-sm">
                <Lock size={12} className="text-blue-500" />
                <span className="text-[9px] font-black text-slate-600 uppercase">SSL 256-BIT</span>
              </div>
              <div className="flex items-center gap-2 p-2 px-3 border border-slate-100 rounded-xl bg-slate-50 shadow-sm">
                <Globe size={12} className="text-blue-500" />
                <span className="text-[9px] font-black text-slate-600 uppercase">Google Cloud Vault</span>
              </div>
              <div className="flex items-center gap-2 p-2 px-3 border border-slate-100 rounded-xl bg-slate-50 shadow-sm">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span className="text-[9px] font-black text-slate-600 uppercase">GDPR COMPLIANT</span>
              </div>
              <div className="flex items-center gap-2 p-2 px-3 border border-slate-100 rounded-xl bg-slate-50 shadow-sm">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span className="text-[9px] font-black text-slate-600 uppercase">L. 25.326 ARG</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Legal & Soporte</h5>
            <div className="flex flex-col gap-3">
               <a href="https://wa.me/5492615000872" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors">
                 <MessageCircle size={14} /> Contactar Legal Center
               </a>
               <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                 <Info size={14} /> Los textos no se almacenan permanentemente.
               </div>
            </div>
            <div className="pt-2 text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
              v4.1.0-ENTERPRISE NODE • RaiivenCloud Financial Services
            </div>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto mt-10 pt-6 border-t border-slate-100 flex justify-between items-center">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">© 2026 RaiivenCloud Intelligence System</span>
            <div className="flex gap-4">
              <span className="text-[9px] font-black text-slate-300 uppercase">Argentina</span>
              <span className="text-[9px] font-black text-slate-300 uppercase">Global</span>
            </div>
        </div>
      </footer>

      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)}
        user={user}
        setIsPaymentPending={setIsPaymentPending}
      />

      <AnimatePresence>
        {showPrintWarning && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[200] max-w-sm w-full px-4"
          >
            <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl border border-white/10 backdrop-blur-xl">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                  <Download size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight">Tip de Impresión</h4>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed mt-1">
                    Si el diálogo de impresión no aparece, es debido a la seguridad del navegador en el modo previsualización. 
                    <span className="text-blue-400 font-bold block mt-1">
                      Haz clic en "Open in new tab" (arriba a la derecha) para descargar tu PDF sin restricciones.
                    </span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowPrintWarning(false)}
                className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
