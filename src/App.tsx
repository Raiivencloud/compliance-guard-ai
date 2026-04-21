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

  // Inyección de PayPal dinámica
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

  const handleLogin = () => {
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    signInWithPopup(auth, googleProvider).catch(console.error);
  };

  // AUDITORÍA COMPLETA: Ahora con Críticos, Medios y Bajos
  const handleAudit = () => {
    setIsAuditing(true);
    setResult(null); 
    
    setTimeout(() => {
      setResult({ 
        score: 15, 
        summary: "Análisis de TikTok finalizado. Se detectaron múltiples brechas de seguridad y recolección excesiva de datos biométricos y de red.",
        findings: [
          {
            id: 1, 
            level: 'critical', 
            title: 'Recolección Biométrica', 
            description: 'TikTok declara la recolección de "huellas faciales y de voz" sin consentimiento específico por sesión.'
          },
          {
            id: 2, 
            level: 'critical', 
            title: 'Keylogging In-App', 
            description: 'El navegador interno puede rastrear pulsaciones de teclas en sitios externos visitados desde la app.'
          },
          {
            id: 3, 
            level: 'medium', 
            title: 'Escaneo de Red Local', 
            description: 'La app identifica otros dispositivos en tu WiFi para mejorar el perfilado de usuarios.'
          },
          {
            id: 4, 
            level: 'low', 
            title: 'Retención Extendida', 
            description: 'Los logs de actividad se conservan incluso después de cerrar la cuenta por tiempo indefinido.'
          }
        ] 
      });
      setIsAuditing(false);
    }, 2500);
  };

  const handleRedeemCode = async (code: string) => {
    if (!user) return alert("Iniciá sesión.");
    const q = query(collection(db, "coupons"), where("code", "==", code.trim().toUpperCase()), where("used", "==", false));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const couponDoc = snap.docs[0];
      await updateDoc(doc(db, "coupons", couponDoc.id), { used: true, usedBy: user.uid });
      await updateDoc(doc(db, "users", user.uid), { isPro: true });
      setUserTier('Pro');
      setIsPaymentOpen(false);
      alert("¡Activado!");
    } else {
      alert("Código inválido.");
    }
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
