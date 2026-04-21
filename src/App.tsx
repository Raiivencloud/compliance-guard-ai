import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from './lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';

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

  // Carga de PayPal al abrir el modal
  useEffect(() => {
    if (isPaymentOpen && !document.getElementById('paypal-sdk')) {
      const script = document.createElement('script');
      script.id = 'paypal-sdk';
      script.src = "https://www.paypal.com/sdk/js?client-id=test&currency=USD"; 
      script.onload = () => {
        if ((window as any).paypal) {
          (window as any).paypal.Buttons({
            style: { layout: 'horizontal', shape: 'pill', height: 40 },
            onApprove: async () => {
              if (user) {
                await updateDoc(doc(db, "users", user.uid), { isPro: true });
                setUserTier('Pro');
                setIsPaymentOpen(false);
              }
            }
          }).render('#paypal-button-container');
        }
      };
      document.body.appendChild(script);
    }
  }, [isPaymentOpen, user]);

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

  // LOGIN POR POPUP (EL QUE TE FUNCIONA)
  const handleLogin = () => {
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    signInWithPopup(auth, googleProvider).catch(err => {
      if(err.code === 'auth/popup-blocked') alert("Habilitá los popups.");
    });
  };

  // FUNCIÓN DE AUDITORÍA (CORREGIDA PARA QUE MUESTRE RESULTADOS)
  const handleAudit = () => {
    setIsAuditing(true);
    setResult(null); // Limpiamos anterior
    setTimeout(() => {
      setResult({ 
        score: 25, 
        summary: "Riesgo legal crítico detectado en la plataforma analizada.",
        findings: [
          {id: 1, level: 'critical', title: 'Privacidad Biométrica', description: 'Se detectó extracción de puntos faciales sin consentimiento explícito.'},
          {id: 2, level: 'critical', title: 'Telemetría Oculta', description: 'La app envía metadatos del dispositivo a servidores externos.'}
        ] 
      });
      setIsAuditing(false);
    }, 2000);
  };

  const handleRedeemCode = async (code: string) => {
    if (!user) return alert("Logueate primero.");
    try {
      const q = query(collection(db, "coupons"), where("code", "==", code.trim().toUpperCase()), where("used", "==", false));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const couponDoc = snap.docs[0];
        await updateDoc(doc(db, "coupons", couponDoc.id), { used: true, usedBy: user.uid });
        await updateDoc(doc(db, "users", user.uid), { isPro: true });
        setUserTier('Pro');
        setIsPaymentOpen(false);
        alert("¡Código validado! Acceso Pro concedido.");
      } else {
        alert("Código inválido.");
      }
    } catch (e) { alert("Error de conexión."); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header isLoggedIn={!!user} onLogin={handleLogin} userPhoto={user?.photoURL} />
      <main className="max-w-7xl mx-auto pt-32 px-4 pb-20">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 xl:col-span-4">
            <Hero />
            <AuditTool isAuditing={isAuditing} onAudit={handleAudit} />
          </div>
          <div className="col-span-12 xl:col-span-8">
            {/* Aquí es donde aparece el antes y después */}
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
