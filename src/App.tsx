import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from './lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserTier(userSnap.data().isPro ? 'Pro' : 'Free');
        } else {
          await setDoc(userRef, { email: currentUser.email, isPro: false });
          setUserTier('Free');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      // Forzamos la selección de cuenta para limpiar errores previos
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Error Google Auth:", error.code);
      alert("Error al conectar: " + error.message);
    }
  };

  const handleRedeemCode = async (code: string) => {
    if (!user) return alert("Iniciá sesión primero.");
    try {
      const q = query(collection(db, "coupons"), where("code", "==", code.trim().toUpperCase()), where("used", "==", false));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const couponDoc = snap.docs[0];
        await updateDoc(doc(db, "coupons", couponDoc.id), { used: true, usedBy: user.uid });
        await updateDoc(doc(db, "users", user.uid), { isPro: true });
        setUserTier('Pro');
        setIsPaymentOpen(false);
        alert("¡Cuenta Pro Activada!");
      } else {
        alert("Código inválido o ya usado.");
      }
    } catch (e) {
      alert("Error de conexión con la base de datos.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header 
        isLoggedIn={!!user} 
        onLogin={handleLogin} 
        onLogout={() => signOut(auth)}
        userPhoto={user?.photoURL} 
      />
      
      <main className="max-w-7xl mx-auto pt-32 pb-20 px-4">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 xl:col-span-4">
            <Hero />
            <div className="bg-white rounded-[2.5rem] p-8 border mt-8 shadow-xl">
              <AuditTool 
                isAuditing={isAuditing}
                onAudit={() => {
                  setIsAuditing(true);
                  setTimeout(() => {
                    setResult({ 
                      score: 25, 
                      findings: [
                        {id: 1, level: 'critical', title: 'Privacidad Biométrica', description: 'Extracción facial detectada.'},
                        {id: 2, level: 'critical', title: 'Monitoreo Pro', description: 'Acceso a metadatos privados.'}
                      ]
                    });
                    setIsAuditing(false);
                  }, 2000);
                }} 
              />
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
        onSuccess={handleRedeemCode} 
      />
    </div>
  );
}

export default App;
