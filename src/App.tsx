import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from './lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithRedirect, getRedirectResult } from 'firebase/auth';

import Header from './components/common/Header';
import Hero from './components/landing/Hero';
import AuditTool from './components/landing/AuditTool';
import ResultsOverview from './components/dashboard/ResultsOverview';
import PaymentModal from './components/modals/PaymentModal';

function App() {
  const [user, setUser] = useState<any>(null);
  const [userTier, setUserTier] = useState<'Free' | 'Pro'>('Free');
  const [isAuditing, setIsAuditing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  useEffect(() => {
    getRedirectResult(auth).catch(console.error);
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

  // FUNCIÓN PARA CANJEAR CÓDIGO (Validación real con Firebase)
  const handleRedeemCode = async (code: string) => {
    if (!user) return alert("Logueate primero, fiera.");
    try {
      const q = query(collection(db, "coupons"), where("code", "==", code.trim().toUpperCase()), where("used", "==", false));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0];
        await updateDoc(doc(db, "coupons", docRef.id), { used: true, usedBy: user.uid });
        await updateDoc(doc(db, "users", user.uid), { isPro: true });
        setUserTier('Pro');
        alert("¡Código activado! Ya tenés acceso total.");
        setIsPaymentOpen(false);
      } else {
        alert("El código no existe o ya lo usaron.");
      }
    } catch (e) { alert("Error al validar."); }
  };

  const handleAudit = async (source: string | File) => {
    setIsAuditing(true);
    setTimeout(() => {
      setResult({
        score: 25,
        summary: "Análisis Crítico: Extracción masiva de biometría detectada.",
        findings: [
          { id: 1, level: 'critical', title: 'Privacidad Biométrica', description: 'Recolección de rostro y voz sin permiso.' },
          { id: 2, level: 'critical', title: 'Monitoreo Pro', description: 'Telemetría profunda del teclado detectada.' },
          { id: 3, level: 'warning', title: 'Jurisdicción', description: 'Tribunales fuera de Argentina.' }
        ]
      });
      setIsAuditing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header isLoggedIn={!!user} onLogin={() => signInWithRedirect(auth, googleProvider)} userPhoto={user?.photoURL} />
      
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
                userTier={userTier} 
                onReset={() => setResult(null)} 
                // AQUÍ EL BLOQUEO: Si no es Pro, abre pagos. Si es Pro, "descarga" (print por ahora)
                onExport={() => userTier === 'Pro' ? window.print() : setIsPaymentOpen(true)} 
              />
            ) : (
              <div className="h-[500px] flex items-center justify-center border-2 border-dashed rounded-[2.5rem] text-slate-400 bg-white">
                {isAuditing ? "Analizando..." : "Sube un archivo para el peritaje"}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL DE PAGOS CON PAYPAL Y CÓDIGO */}
      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
        onRedeemCode={handleRedeemCode}
        onPayPalSuccess={() => {
           // Aquí iría la lógica tras el pago exitoso de PayPal
           setUserTier('Pro');
           setIsPaymentOpen(false);
        }}
      />
    </div>
  );
}

export default App;
