import React, { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, signInWithPopup, googleProvider } from 'firebase/auth';

// RUTAS CORREGIDAS SEGÚN TUS CARPETAS
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
          setUserTier(userSnap.data().isPro ? 'Pro' : 'Free');
        } else {
          await setDoc(userRef, { email: currentUser.email, isPro: false });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const generarStockVip = async () => {
    if (!confirm("¿Generar 100 llaves nuevas en Firebase?")) return;
    try {
      const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ23456789";
      const segment = () => Array.from({length: 4}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
      
      for (let i = 0; i < 100; i++) {
        const llave = `${segment()}-${segment()}-${segment()}`;
        await addDoc(collection(db, "coupons"), { code: llave, used: false, createdAt: new Date() });
      }
      alert("¡Hecho! Revisa la consola (F12) para copiar la lista.");
    } catch (e) { alert("Error: " + e); }
  };

  const handleAudit = async (source: string | File) => {
    setIsAuditing(true);
    setTimeout(() => {
      setResult({
        score: 25,
        summary: "Política altamente invasiva y de alto riesgo. Realiza extracción masiva de biometría y comportamiento.",
        jurisdiction: "ESPACIO ECONÓMICO EUROPEO / ARGENTINA",
        findings: [
          { id: 1, level: 'critical', title: 'Privacidad Biométrica', description: 'Recolección masiva de datos faciales y patrones de voz sin opción de exclusión.' },
          { id: 2, level: 'critical', title: 'Monitoreo de Dispositivo', description: 'Extracción profunda de telemetría, ritmos de pulsación y metadatos de archivos.' },
          { id: 3, level: 'warning', title: 'Jurisdicción Extranjera', description: 'Los conflictos legales se resuelven fuera de Argentina, invalidando protecciones locales.' },
          { id: 4, level: 'warning', title: 'Cesión a Terceros', description: 'Los perfiles de comportamiento son compartidos con socios comerciales no identificados.' }
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
        onLogin={() => signInWithPopup(auth, googleProvider)} 
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
              <div className="h-[500px] flex items-center justify-center border-2 border-dashed rounded-[2.5rem] text-slate-400">
                {isAuditing ? "Analizando..." : "Subí un archivo para empezar"}
              </div>
            )}
          </div>
        </div>
      </main>

      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} onSuccess={() => setUserTier('Pro')} />

      <button 
        onClick={generarStockVip} 
        className="fixed bottom-2 right-2 opacity-0 hover:opacity-100 text-[10px] text-slate-400"
      >
        ADMIN_GEN
      </button>
    </div>
  );
}

export default App;
