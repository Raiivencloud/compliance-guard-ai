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

  // Inyectar PayPal y renderizar botones
  useEffect(() => {
    if (isPaymentOpen) {
      const script = document.createElement('script');
      script.src = "https://www.paypal.com/sdk/js?client-id=test&currency=USD"; // Cambiá 'test' por tu ID
      script.addEventListener('load', () => {
        if ((window as any).paypal) {
          (window as any).paypal.Buttons({
            style: { layout: 'horizontal', shape: 'pill' },
            onApprove: async () => {
              if (user) {
                await updateDoc(doc(db, "users", user.uid), { isPro: true });
                setUserTier('Pro');
                setIsPaymentOpen(false);
              }
            }
          }).render('#paypal-button-container');
        }
      });
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

  const handlePaymentSuccess = async (code?: string) => {
    if (!user) return alert("Iniciá sesión primero.");
    if (code) {
      const q = query(collection(db, "coupons"), where("code", "==", code.trim().toUpperCase()), where("used", "==", false));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const coupon = snap.docs[0];
        await updateDoc(doc(db, "coupons", coupon.id), { used: true, usedBy: user.uid });
        await updateDoc(doc(db, "users", user.uid), { isPro: true });
        setUserTier('Pro');
        setIsPaymentOpen(false);
        alert("¡Éxito! Ahora sos Pro.");
      } else { alert("Código inválido."); }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header isLoggedIn={!!user} onLogin={() => signInWithPopup(auth, googleProvider)} userPhoto={user?.photoURL} />
      <main className="max-w-7xl mx-auto pt-32 px-4">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 xl:col-span-4">
            <Hero />
            <AuditTool onAudit={(s) => {
              setIsAuditing(true);
              setTimeout(() => {
                setResult({ score: 25, findings: [{id:1, level:'critical', title:'Biometría', description:'Extracción facial sin aviso.'}, {id:2, level:'critical', title:'Telemetría', description:'Acceso a datos privados del sistema.'}] });
                setIsAuditing(false);
              }, 2000);
            }} isAuditing={isAuditing} />
          </div>
          <div className="col-span-12 xl:col-span-8">
            {result && (
              <ResultsOverview result={result} userTier={userTier} onExport={() => userTier === 'Pro' ? window.print() : setIsPaymentOpen(true)} />
            )}
          </div>
        </div>
      </main>
      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} onSuccess={handlePaymentSuccess} />
    </div>
  );
}

export default App;
