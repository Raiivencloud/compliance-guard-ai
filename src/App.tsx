import React, { useState, useEffect } from 'react';
import { auth, googleProvider, db } from './lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import Header from './components/common/Header';
import Hero from './components/landing/Hero';
import AuditTool from './components/landing/AuditTool';
import ResultsOverview from './components/dashboard/ResultsOverview';
import PaymentModal from './components/modals/PaymentModal';

function App() {
  const [activeView, setActiveView] = useState('audit');
  const [user, setUser] = useState<User | null>(null);
  const [userTier, setUserTier] = useState('Free');
  const [isAuditing, setIsAuditing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // 1. Escuchar cambios en la sesión de Google
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Al loguearse, consultamos en Firestore si es Pro
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && userDoc.data().isPro) {
          setUserTier('Pro');
        } else {
          setUserTier('Free');
          // Si es nuevo, lo creamos en la base de datos
          if (!userDoc.exists()) {
            await setDoc(doc(db, "users", currentUser.uid), {
              email: currentUser.email,
              isPro: false,
              createdAt: new Date()
            });
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (user) {
      await signOut(auth);
      setUserTier('Free');
    } else {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (error) {
        console.error("Error en Login:", error);
      }
    }
  };

  const handlePaymentSuccess = async () => {
    if (!user) return alert("Primero debés iniciar sesión con Google.");
    
    const code = prompt("Ingresá el código de activación:");
    if (code?.toUpperCase() === 'RAIIVEN') {
      // 2. GUARDAR EN LA NUBE: Activamos el Pro en Firestore
      await updateDoc(doc(db, "users", user.uid), { isPro: true });
      setUserTier('Pro');
      setIsPaymentOpen(false);
      alert('¡Acceso PRO vinculado a tu cuenta de Google!');
    } else if (code !== null) {
      alert('Código incorrecto.');
    }
  };

  // ... (handleAudit sigue igual que antes)
  const handleAudit = async (source: string | File) => {
    setIsAuditing(true);
    setResult(null);
    setTimeout(() => {
      setResult({
        score: 64,
        findings: [{ id: 1, level: 'critical', title: 'Datos Biométricos', description: 'Riesgo legal detectado.' }],
        summary: "Análisis finalizado.",
        jurisdiction: "MENDOZA / ARGENTINA"
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
        {activeView === 'audit' && (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 xl:col-span-4 space-y-8">
              <Hero />
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl">
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
                <div className="h-[400px] flex items-center justify-center bg-white/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-slate-400">
                  {isAuditing ? "Analizando..." : "Subí un documento para empezar"}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
        onSuccess={handlePaymentSuccess} 
      />
    </div>
  );
}

export default App;
