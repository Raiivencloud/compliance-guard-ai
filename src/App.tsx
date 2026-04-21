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

  // Cargar SDK de PayPal automáticamente
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://www.paypal.com/sdk/js?client-id=test&currency=USD"; // Reemplazá 'test' por tu Client ID de PayPal
    script.async = true;
    document.body.appendChild(script);
  }, []);

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

  const handleLogin = () => signInWithPopup(auth, googleProvider);

  // ESTA ES LA FUNCIÓN QUE CORREGÍ PARA QUE EL CÓDIGO ANDE
  const handleRedeemCode = async (code: string) => {
    if (!code || !user) return alert("Iniciá sesión primero.");
    
    try {
      // Buscamos el código exacto en la colección 'coupons' que esté sin usar
      const q = query(
        collection(db, "coupons"), 
        where("code", "==", code.trim().toUpperCase()), 
        where("used", "==", false)
      );
      
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const couponDoc = snap.docs[0];
        // 1. Marcamos el cupón como usado
        await updateDoc(doc(db, "coupons", couponDoc.id), { 
          used: true, 
          usedBy: user.uid,
          usedAt: new Date().toISOString()
        });
        // 2. Le damos el rango Pro al usuario en Firestore
        await updateDoc(doc(db, "users", user.uid), { isPro: true });
        
        setUserTier('Pro');
        alert("¡Código aceptado! Ya tenés acceso Pro.");
        setIsPaymentOpen(false);
      } else {
        alert("Código incorrecto, ya usado o inexistente.");
      }
    } catch (e) {
      console.error(e);
      alert("Error al validar el código.");
    }
  };

  const handleAudit = async (source: string | File) => {
    setIsAuditing(true);
    setTimeout(() => {
      setResult({
        score: 25,
        summary: "Política altamente invasiva detectada por la IA.",
        jurisdiction: "EUROPA / ARGENTINA (MENDOZA)",
        findings: [
          { id: 1, level: 'critical', title: 'Privacidad Biométrica', description: 'Extracción de datos faciales detectada.' },
          { id: 2, level: 'critical', title: 'Monitoreo de Dispositivo', description: 'Acceso a metadatos privados del sistema.' },
          { id: 3, level: 'warning', title: 'Jurisdicción', description: 'Conflictos fuera de Argentina.' }
        ]
      });
      setIsAuditing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header isLoggedIn={!!user} onLogin={handleLogin} userPhoto={user?.photoURL} />
      
      <main className="max-w-7xl mx-auto pt-32 px-4">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 xl:col-span-4">
            <Hero />
            <div className="bg-white rounded-[2.5rem] p-8 border mt-8 shadow-xl">
              <AuditTool onAudit={handleAudit} isAuditing={isAuditing} />
            </div>
          </div>

          <div className="col-span-12 xl:col-span-8">
            {result && (
              <ResultsOverview 
                result={result} 
                userTier={userTier} 
                onReset={() => setResult(null)} 
                onExport={() => userTier === 'Pro' ? window.print() : setIsPaymentOpen(true)} 
              />
            )}
          </div>
        </div>
      </main>

      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
        onRedeemCode={handleRedeemCode} // Conectamos la función arreglada
      />
    </div>
  );
}

export default App;
