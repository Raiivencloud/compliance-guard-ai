import React, { useState, useEffect } from 'react';
import { auth, googleProvider, db } from './lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

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

  // --- FUNCIÓN SECRETA PARA GENERAR 100 LLAVES ---
  const generarStockVip = async () => {
    if (!confirm("¿Generar 100 llaves nuevas en Firebase?")) return;
    const { collection, addDoc } = await import('firebase/firestore');
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const segment = () => Array.from({length: 4}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    
    try {
      const nuevasLlaves: string[] = [];
      for (let i = 0; i < 100; i++) {
        const llave = `${segment()}-${segment()}-${segment()}`;
        await setDoc(doc(db, "coupons", llave), { used: false, createdAt: new Date() });
        nuevasLlaves.push(llave);
      }
      console.log("📋 TUS 100 LLAVES:\n" + nuevasLlaves.join("\n"));
      alert("✅ ¡Hecho! Revisá la consola (F12) para copiar la lista.");
    } catch (e) { alert("Error: " + e); }
  };

  const handleLogin = async () => {
    if (user) { await signOut(auth); setUserTier('Free'); }
    else { try { await signInWithPopup(auth, googleProvider); } catch (err) { console.error(err); } }
  };

  const handlePaymentSuccess = async () => {
    if (!user) return alert("Logueate primero.");
    const input = prompt("Ingresá tu llave (XXXX-XXXX-XXXX):");
    if (!input) return;
    const code = input.trim().toUpperCase();

    try {
      const couponRef = doc(db, "coupons", code);
      const couponSnap = await getDoc(couponRef);
      if (couponSnap.exists() && !couponSnap.data().used) {
        await updateDoc(doc(db, "users", user.uid), { isPro: true });
        await updateDoc(couponRef, { used: true, usedBy: user.email, date: new Date() });
        setUserTier('Pro');
        setIsPaymentOpen(false);
        alert("¡Cuenta Pro Activada!");
      } else { alert("Llave inválida o ya usada."); }
    } catch (e) { alert("Error de conexión."); }
  };

  const handleAudit = async (source: string | File) => {
    setIsAuditing(true);
    setTimeout(() => {
      setResult({
        score: 64,
        findings: [{ id: 1, level: 'critical', title: 'Privacidad Biométrica', description: 'Recolección de datos sin aviso.' }],
        summary: "Análisis completado.",
        jurisdiction: "MENDOZA / ARGENTINA"
      });
      setIsAuditing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onViewChange={setActiveView} isLoggedIn={!!user} onLogin={handleLogin} userPhoto={user?.photoURL} />
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
              <ResultsOverview result={result} onReset={() => setResult(null)} userTier={userTier} onExport={() => userTier === 'Pro' ? window.print() : setIsPaymentOpen(true)} />
            ) : (
              <div className="h-[500px] flex items-center justify-center border-2 border-dashed rounded-[2.5rem] text-slate-400">
                {isAuditing ? "Analizando..." : "Subí un archivo para empezar"}
              </div>
            )}
          </div>
        </div>
      </main>
      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} onSuccess={handlePaymentSuccess} />
      
      {/* BOTÓN SECRETO ABAJO A LA DERECHA */}
      <button onClick={generarStockVip} className="fixed bottom-2 right-2 opacity-0 hover:opacity-100 text-[10px] text-slate-400">
        ADMIN_GEN
      </button>
    </div>
  );
}

export default App;
