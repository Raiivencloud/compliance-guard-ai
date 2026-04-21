import React, { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Sidebar from './components/layout/Sidebar';
import DashboardHeader from './components/dashboard/DashboardHeader';
import AuditSection from './components/dashboard/AuditSection';
import ResultsOverview from './components/dashboard/ResultsOverview';
import SettingsView from './components/dashboard/SettingsView';

function App() {
  const [user, setUser] = useState<any>(null);
  const [userTier, setUserTier] = useState<'Free' | 'Pro'>('Free');
  const [activeTab, setActiveTab] = useState('audit');
  const [isAuditing, setIsAuditing] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Verifica si el usuario es Pro en la nueva base de datos
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserTier(userDoc.data().isPro ? 'Pro' : 'Free');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const generarStockVip = async () => {
    try {
      const newCoupons = Array.from({ length: 100 }, () => ({
        code: Math.random().toString(36).substring(2, 10).toUpperCase(),
        isUsed: false,
        value: "premium",
        createdAt: new Date().toISOString()
      }));

      for (const coupon of newCoupons) {
        // Mantenemos "coupons" como pediste
        await addDoc(collection(db, "coupons"), coupon);
      }
      alert("¡100 cupones generados con éxito en la colección 'coupons'!");
    } catch (error) {
      console.error("Error al generar cupones:", error);
    }
  };

  const handleAudit = async (source: string | File) => {
    setIsAuditing(true);
    // Simulamos la potencia del análisis que tenías antes
    setTimeout(() => {
      setResult({
        score: 28,
        summary: "Se han detectado múltiples vulnerabilidades críticas de privacidad y cláusulas legales abusivas.",
        jurisdiction: "INTERNACIONAL / ARGENTINA",
        findings: [
          {
            id: 1,
            level: 'critical',
            category: 'Privacidad',
            title: 'Extracción de Datos Biométricos',
            description: 'La plataforma recolecta patrones faciales y de voz para entrenamiento de modelos de IA sin posibilidad de revocación.'
          },
          {
            id: 2,
            level: 'critical',
            category: 'Seguridad',
            title: 'Monitoreo en Segundo Plano',
            description: 'Extracción de metadatos de archivos locales y seguimiento de actividad fuera de la aplicación.'
          },
          {
            id: 3,
            level: 'warning',
            category: 'Legal',
            title: 'Renuncia a Jurisdicción Local',
            description: 'El contrato obliga a resolver disputas en tribunales extranjeros, invalidando la Ley de Defensa al Consumidor.'
          },
          {
            id: 4,
            level: 'warning',
            category: 'Privacidad',
            title: 'Cesión de Perfil de Comportamiento',
            description: 'Venta de perfiles psicológicos derivados del uso a brokers de datos no especificados.'
          }
        ]
      });
      setIsAuditing(false);
    }, 2500);
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
        
        <DashboardHeader user={user} userTier={userTier} />
        
        <div className="flex-1 overflow-y-auto p-6 relative z-10">
          {activeTab === 'audit' && (
            <div className="space-y-6">
              {!result ? (
                <AuditSection onAudit={handleAudit} isAuditing={isAuditing} />
              ) : (
                <ResultsOverview 
                  result={result} 
                  userTier={userTier} 
                  onReset={() => setResult(null)} 
                />
              )}
            </div>
          )}
          
          {activeTab === 'settings' && (
            <SettingsView 
              user={user} 
              userTier={userTier} 
              onGenerateCodes={generarStockVip} 
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
