import React, { useState, useEffect } from 'react';
// Importamos todo lo necesario desde tu propia configuración de firebase
import { auth, db, googleProvider } from './lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';

// RUTAS SEGÚN TU ESTRUCTURA DE CARPETAS (ff58f2)
import Header from './components/common/Header';
import Hero from './components/landing/Hero';
import AuditTool from './components/landing/AuditTool';
import ResultsOverview from './components/dashboard/ResultsOverview';
import PaymentModal from './components/modals/PaymentModal';

type UserTier = 'Free' | 'Pro';

function App() {
  const [activeView, setActiveView] = useState('audit');
  const [user, setUser] = useState<any>(null);
  const [userTier, setUserTier] = useState<UserTier>('Free');
  const [isAuditing, setIsAuditing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          // Buscamos el campo isPro que configuramos en Firestore
          setUserTier(userSnap.data().isPro ? 'Pro' : 'Free');
        } else {
          // Si el usuario es nuevo, lo creamos como Free
          await setDoc(userRef, { email: currentUser.email, isPro: false });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error en login:", error);
    }
  };

  const generarStockVip = async () => {
    if (!confirm("¿Generar 100 llaves nuevas en Firebase?")) return;
    try {
      const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ23456789";
      const segment = () => Array.from({length: 4}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
      
      for (let i = 0; i < 100; i++) {
        const llave = `${segment()}-${segment()}-${segment()}`;
        // Mantenemos "coupons" como en tu base de datos ff6b1e
        await addDoc(collection(db, "coupons"), { 
          code: llave, 
          used: false, 
          createdAt: new Date().toISOString() 
        });
      }
      alert("¡100 cupones generados con éxito!");
    } catch (e) { alert("Error: " + e); }
  };

  const handleAudit = async (source: string | File) => {
    setIsAuditing(true);
    // Simulación del peritaje potente de esta mañana
    setTimeout(() => {
      setResult({
        score: 25,
        summary: "Política altamente invasiva. Realiza extracción masiva de biometría y comportamiento para perfilado e IA.",
        jurisdiction: "EUROPA / ARGENTINA (MENDOZA)",
        findings: [
          { id: 1, level: 'critical', title: 'Privacidad Biométrica', description: 'Escaneo masivo de rostro y voz sin opción de exclusión.' },
          { id: 2, level: 'critical', title: 'Monitoreo Profundo', description: 'Extracción de telemetría, ritmos de teclado y metadatos privados.' },
          { id: 3, level: 'warning', title: 'Jurisdicción Extranjera', description: 'Conflictos resueltos fuera de Argentina, anulando defensas locales.' },
          { id: 4, level: 'warning', title: 'Venta de Perfiles', description: 'Cesión de datos a brokers comerciales para publicidad dirigida.' }
        ]
      });
      setIsAuditing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        onViewChange={setActiveView} 
        isLoggedIn={!!user} 
        onLogin={handleLogin} 
        userPhoto={user?.photoURL} 
      />
      
      <main className="max-w-7xl mx-auto pt-32 pb-20 px-4">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 xl:col-span-4">
            <Hero />
            <div className="bg-white rounded-[2.5rem] p-8 border mt-8 shadow-xl">
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
            ) : (
              <div className="h-[500px] flex items-center justify-center border-2 border-dashed rounded-[2.5rem] text-slate-400 bg-white">
                {isAuditing ? "Analizando con IA..." : "Sube una URL o PDF para iniciar el peritaje"}
              </div>
            )}
          </div>
        </div>
      </main>

      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
        onSuccess={() => setUserTier('Pro')} 
      />

      <button 
        onClick={generarStockVip} 
        className="fixed bottom-2 right-2 opacity-0 hover:opacity-100 text-[10px] text-slate-400"
      >
        ADMIN_GEN_KEYS
      </button>
    </div>
  );
}

export default App;
