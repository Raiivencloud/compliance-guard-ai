import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from './lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';

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
        }
      } else {
        setUserTier('Free');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleRedeemCode = async (code: string) => {
    if (!user) return alert("Debes iniciar sesión");
    try {
      const q = query(collection(db, "coupons"), where("code", "==", code.trim().toUpperCase()), where("used", "==", false));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const couponDoc = querySnapshot.docs[0];
        // 1. Marcar cupón como usado
        await updateDoc(doc(db, "coupons", couponDoc.id), { used: true, usedBy: user.uid });
        // 2. Darle Pro al usuario
        await updateDoc(doc(db, "users", user.uid), { isPro: true });
        setUserTier('Pro');
        alert("¡Código activado! Ahora eres Pro.");
        setIsPaymentOpen(false);
      } else {
        alert("Código inválido o ya utilizado.");
      }
    } catch (e) {
      alert("Error al validar código.");
    }
  };

  const handleAudit = async (source: string | File) => {
    setIsAuditing(true);
    setTimeout(() => {
      setResult({
        score: 25,
        summary: "Política altamente invasiva. Realiza extracción masiva de biometría y comportamiento.",
        jurisdiction: "EUROPA / ARGENTINA (MENDOZA)",
        findings: [
          { id: 1, level: 'critical', title: 'Privacidad Biométrica', description: 'Recolección masiva de datos faciales y patrones de voz sin consentimiento.' },
          { id: 2, level: 'critical', title: 'Monitoreo Profundo', description: 'Extracción de telemetría y metadatos de archivos privados.' },
          { id: 3, level: 'warning', title: 'Jurisdicción Extranjera', description: 'Conflictos resueltos fuera de Argentina.' },
          { id: 4, level: 'warning', title: 'Venta de Datos', description: 'Cesión de perfiles a brokers comerciales.' }
        ]
      });
      setIsAuditing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
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
            <div className="bg-[#111] rounded-[2.5rem] p-8 border border-white/10 mt-8 shadow-2xl">
              <AuditTool onAudit={handleAudit} isAuditing={isAuditing} />
            </div>
          </div>

          <div className="col-span-12 xl:col-span-8">
            {!isAuditing && result ? (
              <ResultsOverview 
                result={result} 
                onReset={() => setResult(null)} 
                userTier={userTier} 
                // Si no es Pro, abre el modal de pago
                onExport={() => userTier === 'Pro' ? window.print() : setIsPaymentOpen(true)} 
              />
            ) : (
              <div className="h-[500px] flex items-center justify-center border-2 border-dashed border-white/10 rounded-[2.5rem] text-slate-500 bg-[#111]">
                {isAuditing ? "Analizando con IA..." : "Sube una URL o PDF para iniciar el peritaje"}
              </div>
            )}
          </div>
        </div>
      </main>

      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
        onRedeemCode={handleRedeemCode}
        userTier={userTier}
      />
    </div>
  );
}

export default App;
