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

  // 1. CARGA DE PAYPAL MANUAL (Sin librerías)
  useEffect(() => {
    if (isPaymentOpen && !(window as any).paypal) {
      const script = document.createElement('script');
      script.src = "https://www.paypal.com/sdk/js?client-id=test&currency=USD"; // Cambiá 'test' por tu ID de PayPal
      script.onload = () => {
        (window as any).paypal.Buttons({
          style: { layout: 'horizontal', shape: 'pill', height: 48 },
          onApprove: async () => {
            if (user) {
              await updateDoc(doc(db, "users", user.uid), { isPro: true });
              setUserTier('Pro');
              setIsPaymentOpen(false);
            }
          }
        }).render('#paypal-button-container');
      };
      document.body.appendChild(script);
    }
  }, [isPaymentOpen, user]);

  // 2. MANEJO DE LOGIN (Redirect para evitar Error 401)
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

  const handleRedeemCode = async (code: string) => {
    if (!user) return alert("Iniciá sesión primero.");
    const q = query(collection(db, "coupons"), where("code", "==", code.trim().toUpperCase()), where("used", "==", false));
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      const couponDoc = snap.docs[0];
      await updateDoc(doc(db, "coupons", couponDoc.id), { used: true, usedBy: user.uid });
      await updateDoc(doc(db, "users", user.uid), { isPro: true });
      setUserTier('Pro');
      setIsPaymentOpen(false);
      alert("¡Código Activado! Ya sos Pro.");
    } else {
      alert("Código inválido o ya usado.");
    }
  };

  const handleAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setResult({
        score: 25,
        summary: "Política de Alto Riesgo detectada por ComplianceGuard AI.",
        jurisdiction: "MENDOZA / ARGENTINA",
        findings: [
          { id: 1, level: 'critical', title: 'Privacidad Biométrica', description: 'Extracción facial masiva sin opción de exclusión.' },
          { id: 2, level: 'critical', title: 'Monitoreo de Dispositivo', description: 'Acceso a metadatos privados y telemetría profunda.' }
        ]
      });
      setIsAuditing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header isLoggedIn={!!user} onLogin={() => signInWithRedirect(auth, googleProvider)} userPhoto={user?.photoURL} />
      <main className="max-w-7xl mx-auto pt-32 px-4">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 xl:col-span-4">
            <Hero />
            <AuditTool onAudit={handleAudit} isAuditing={isAuditing} />
          </div>
          <div className="col-span-12 xl:col-span-8">
            {result && (
              <ResultsOverview 
                result={result} 
                userTier={userTier} 
                onExport={() => userTier === 'Pro' ? window.print() : setIsPaymentOpen(true)} 
              />
            )}
          </div>
        </div>
      </main>
      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} onSuccess={handleRedeemCode} />
    </div>
  );
}

export default App;
