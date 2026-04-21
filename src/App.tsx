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
  const [activeView, setActiveView] = useState('audit');
  const [user, setUser] = useState<any>(null);
  const [userTier, setUserTier] = useState<'Free' | 'Pro'>('Free');
  const [isAuditing, setIsAuditing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  useEffect(() => {
    // 1. ESTO ES LO NUEVO: Pesca el resultado del redireccionamiento apenas carga
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log("Login exitoso mediante redirect");
        }
      } catch (error) {
        console.error("Error al procesar el login:", error);
      }
    };
    checkRedirect();

    // 2. Escucha cambios en el estado del usuario
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUserTier(userSnap.data().isPro ? 'Pro' : 'Free');
        } else {
          // Si es nuevo, lo creamos en Firestore
          await setDoc(userRef, { 
            email: currentUser.email, 
            isPro: false,
            displayName: currentUser.displayName 
          });
          setUserTier('Free');
        }
      } else {
        setUser(null);
        setUserTier('Free');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Error al iniciar login:", error);
    }
  };

  const handleRedeemCode = async (code: string) => {
    if (!user) return alert("Iniciá sesión primero");
    const q = query(collection(db, "coupons"), where("code", "==", code.trim().toUpperCase()), where("used", "==", false));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0];
      await updateDoc(doc(db, "coupons", docRef.id), { used: true, usedBy: user.uid });
      await updateDoc(doc(db, "users", user.uid), { isPro: true });
      setUserTier('Pro');
      alert("¡Código activado!");
      setIsPaymentOpen(false);
    } else {
      alert("Código no válido o ya usado.");
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
          { id: 1, level: 'critical', title: 'Privacidad Biométrica', description: 'Recolección masiva de datos faciales y voz sin consentimiento explícito.' },
          { id: 2, level: 'critical', title: 'Monitoreo Profundo', description: 'Extracción de telemetría, ritmos de teclado y metadatos privados del dispositivo.' },
          { id: 3, level: 'warning', title: 'Jurisdicción Extranjera', description: 'Conflictos legales resueltos en tribunales de California, invalidando leyes locales.' },
          { id: 4, level: 'warning', title: 'Venta de Perfiles', description: 'Cesión de datos a terceros no identificados para publicidad conductual.' }
        ]
      });
      setIsAuditing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        onViewChange={setActiveView} 
        isLoggedIn={!!user} 
        onLogin={handleLogin} 
        userPhoto={user?.photoURL} 
      />
      
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
                onReset={() => setResult(null)} 
                userTier={userTier} 
                onExport={() => userTier === 'Pro' ? window.print() : setIsPaymentOpen(true)} 
              />
            ) : (
              <div className="h-[500px] flex items-center justify-center border-2 border-dashed rounded-[2.5rem] text-slate-400 bg-white">
                {isAuditing ? "Analizando con IA..." : "Sube un archivo para empezar el peritaje"}
              </div>
            )}
          </div>
        </div>
      </main>

      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
        onRedeemCode={handleRedeemCode}
      />
    </div>
  );
}

export default App;
