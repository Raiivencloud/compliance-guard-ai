import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from './lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserTier(userSnap.data().isPro ? 'Pro' : 'Free');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // ESTA ES LA FUNCIÓN QUE EL MODAL DEBE LLAMAR PARA LOS CÓDIGOS
  const handleRedeemCode = async (code: string) => {
    if (!user) return alert("Iniciá sesión primero");
    try {
      const q = query(collection(db, "coupons"), where("code", "==", code.trim().toUpperCase()), where("used", "==", false));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const couponDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, "coupons", couponDoc.id), { used: true, usedBy: user.uid });
        await updateDoc(doc(db, "users", user.uid), { isPro: true });
        setUserTier('Pro');
        alert("¡Éxito! Ahora sos Pro.");
        setIsPaymentOpen(false);
      } else {
        alert("Código inválido.");
      }
    } catch (e) { alert("Error al validar."); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        isLoggedIn={!!user} 
        onLogin={() => signInWithPopup(auth, googleProvider)} 
        userPhoto={user?.photoURL} 
      />
      
      <main className="max-w-7xl mx-auto pt-32 px-4">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 xl:col-span-4">
            <Hero />
            <AuditTool onAudit={(s) => {
              setIsAuditing(true);
              setTimeout(() => {
                setResult({ score: 25, findings: [{id:1, level:'critical', title:'Biometría', description:'Extracción facial detected.'}] });
                setIsAuditing(false);
              }, 2000);
            }} isAuditing={isAuditing} />
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
        onRedeemCode={handleRedeemCode} // IMPORTANTE: Pasamos la función al modal
      />
    </div>
  );
}

export default App;
