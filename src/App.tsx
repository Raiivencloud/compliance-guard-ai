import React, { useState, useEffect } from 'react';
import { auth, googleProvider, db } from './lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import Header from './components/common/Header';
import Hero from './components/landing/Hero';
import AuditTool from './components/landing/AuditTool';
import ResultsOverview from './components/dashboard/ResultsOverview';
import PaymentModal from './components/modals/PaymentModal';

function App() {
  const [activeView, setActiveView] = useState('audit');
  const [user, setUser] = useState<any>(null);
  const [userTier, setUserTier] = useState('Free');
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
          if (userSnap.data().isPro) setUserTier('Pro');
        } else {
          await setDoc(userRef, { email: currentUser.email, isPro: false });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (user) {
      await signOut(auth);
      setUserTier('Free');
      alert("Sesión cerrada");
    } else {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (err) {
        console.error("Error en login:", err);
      }
    }
  };

  const handlePaymentSuccess = async () => {
    if (!user) return alert("Iniciá sesión con Google para activar el modo Pro.");
    const code = prompt("Ingresá el código de activación:");
    if (code?.toUpperCase() === 'RAIIVEN') {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { isPro: true });
      setUserTier('Pro');
      setIsPaymentOpen(false);
      alert("¡Cuenta Pro activada permanentemente!");
    } else if (code !== null) {
      alert("Código incorrecto.");
    }
  };

  const handleAudit = async (source: string | File) => {
    setIsAuditing(true);
    setResult(null);
    setTimeout(() => {
      setResult({
        score: 64,
        findings: [
          { id: 1, level: 'critical', title: 'Privacidad Biométrica', description: 'Recolección de datos faciales detectada.' },
          { id: 2, level: 'critical', title: 'Jurisdicción', description: 'Datos procesados en servidores fuera de Argentina.' }
        ],
        summary: "Auditoría finalizada. Riesgos detectados en la política legal.",
        jurisdiction: "MENDOZA / ARGENTINA"
      });
      setIsAuditing(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onViewChange={setActiveView} isLoggedIn={!!user} onLogin={handleLogin} userPhoto={user?.photoURL} />
      <main className="max-w-7xl mx-auto pt-32 pb-20 px-4">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 xl:col-span-4">
            <Hero />
            <div className="bg-white rounded-[2.5rem] p-8 border mt-8 shadow-xl shadow-blue-900/5">
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
              <div className="h-[500px] flex items-center justify-center bg-white/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-slate-400 font-medium">
                {isAuditing ? "Analizando política legal..." : "Subí un documento para empezar el peritaje"}
              </div>
            )}
          </div>
        </div>
      </main>
      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} onSuccess={handlePaymentSuccess} />
    </div>
  );
}

export default App;
