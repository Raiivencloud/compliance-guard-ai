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
    // 1. ESTO ES LO QUE ARREGLA LA PANTALLA COMPLETA
    // Al recargar la página tras el login, esto captura al usuario.
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("Login exitoso tras pantalla completa");
        }
      })
      .catch((error) => {
        console.error("Error al volver de Google:", error.code);
      });

    // 2. Observador de estado (mantiene la sesión activa)
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

  // Función de login: PANTALLA COMPLETA (Evita el error 401)
  const handleLogin = () => signInWithRedirect(auth, googleProvider);

  // Validación de códigos arreglada
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
      alert("Error al conectar con la base de datos.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header isLoggedIn={!!user} onLogin={handleLogin} userPhoto={user?.photoURL} />
      <main className="max-w-7xl mx-auto pt-32 px-4 pb-20">
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
                        {id: 1, level: 'critical', title: 'Riesgo Biométrico', description: 'Extracción facial detectada.'}
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
