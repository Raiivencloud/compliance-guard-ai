import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from './lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { jsPDF } from 'jspdf'; // Necesitás instalar esta librería: npm install jspdf

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
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // GENERADOR DE PDF PROFESIONAL (No es una impresión de pantalla)
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Reporte de Peritaje Legal IA", 20, 20);
    doc.setFontSize(12);
    doc.text(`Jurisdicción: ${result.jurisdiction}`, 20, 40);
    doc.text(`Puntaje de Riesgo: ${result.score}/100`, 20, 50);
    
    let y = 70;
    result.findings.forEach((f: any) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${f.title} (${f.level})`, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(f.description, 20, y + 7, { maxWidth: 170 });
      y += 25;
    });

    doc.save("Peritaje_Compliance_AI.pdf");
  };

  const handleRedeemCode = async (code: string) => {
    if (!user) return alert("Iniciá sesión");
    const q = query(collection(db, "coupons"), where("code", "==", code.trim().toUpperCase()), where("used", "==", false));
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      const coupon = snap.docs[0];
      await updateDoc(doc(db, "coupons", coupon.id), { used: true, usedBy: user.uid });
      await updateDoc(doc(db, "users", user.uid), { isPro: true });
      setUserTier('Pro');
      alert("¡Cuenta Pro activada!");
      setIsPaymentOpen(false);
    } else {
      alert("Código inválido.");
    }
  };

  const handleAudit = async (source: string | File) => {
    setIsAuditing(true);
    setTimeout(() => {
      setResult({
        score: 25,
        jurisdiction: "Mendoza, Argentina / Internacional",
        findings: [
          { id: 1, level: 'critical', title: 'Privacidad Biométrica', description: 'Extracción masiva de datos faciales detectada.' },
          { id: 2, level: 'critical', title: 'Monitoreo de Dispositivo', description: 'Acceso a metadatos privados del sistema.' },
          { id: 3, level: 'warning', title: 'Jurisdicción Extranjera', description: 'Cláusulas de arbitraje fuera del país.' }
        ]
      });
      setIsAuditing(false);
    }, 2000);
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
            <AuditTool onAudit={handleAudit} isAuditing={isAuditing} />
          </div>

          <div className="col-span-12 xl:col-span-8">
            {result && (
              <ResultsOverview 
                result={result} 
                userTier={userTier} 
                // Si es Pro, baja el PDF real. Si no, abre pagos.
                onExport={() => userTier === 'Pro' ? downloadPDF() : setIsPaymentOpen(true)} 
              />
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
