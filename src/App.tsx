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

  // 1. Escuchar la sesión de forma constante
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserTier(userSnap.data().isPro ? 'Pro' : 'Free');
        } else {
          // Si el usuario se loguea por primera vez, lo creamos
          await setDoc(userRef, { email: currentUser.email, isPro: false });
          setUserTier('Free');
        }
      } else {
        setUserTier('Free');
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Función de Login con manejo de Pop-ups
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        alert("El navegador bloqueó la ventana de inicio. Por favor, permití los pop-ups para esta web.");
      } else {
        alert("Error al conectar con Google: " + error.message);
      }
    }
  };

  // 3. Validación de Códigos (Firestore)
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
        alert("¡Código canjeado con éxito! Ya sos Pro.");
      } else {
        alert("Ese código no es válido o ya fue usado.");
      }
    } catch (e) {
      alert("Hubo un problema al conectar con la base de datos.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        isLoggedIn={!!user} 
        onLogin={handleLogin} 
        userPhoto={user?.photoURL} 
      />
      
      <main className="max-w-7xl mx-auto pt-32 px-4">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 xl:col-span-4">
            <Hero />
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

      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
        onSuccess={handleRedeemCode} 
      />
    </div>
  );
}

export default App;
