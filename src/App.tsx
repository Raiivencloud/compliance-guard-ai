import React, { useState, useEffect } from 'react';
import Header from './components/common/Header';
import Hero from './components/landing/Hero';
import AuditTool from './components/landing/AuditTool';
import ResultsOverview from './components/dashboard/ResultsOverview';
import HistoryView from './components/dashboard/HistoryView';
import SettingsView from './components/dashboard/SettingsView';
import PaymentModal from './components/modals/PaymentModal';

function App() {
  const [activeView, setActiveView] = useState('audit');
  const [isAuditing, setIsAuditing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [userTier, setUserTier] = useState('Free');

  // Recuperar estado premium al cargar la página
  useEffect(() => {
    const isPro = localStorage.getItem('audit_premium') === 'true';
    if (isPro) setUserTier('Pro');
  }, []);

  // Función que se ejecuta cuando el usuario hace clic en "Pagar" dentro del modal
  const handlePaymentSuccess = () => {
    setUserTier('Pro');
    setIsPaymentOpen(false);
    localStorage.setItem('audit_premium', 'true');
  };

  const handleAudit = async (source: string | File) => {
    setIsAuditing(true);
    setResult(null);
    
    // Simulamos carga profunda de 3 segundos
    setTimeout(() => {
      const mockResult = {
        score: 64,
        findings: [
          { 
            id: 1, level: 'critical', color: 'red', 
            title: 'Recolección de Biometría', 
            description: 'TikTok recolecta huellas faciales y de voz sin consentimiento explícito según Ley 25.326 de Argentina.' 
          },
          { 
            id: 2, level: 'critical', color: 'red', 
            title: 'Transferencia a Terceros', 
            description: 'Se detectó el envío de datos a servidores en jurisdicciones sin niveles de protección adecuados.' 
          },
          { 
            id: 3, level: 'warning', color: 'amber', 
            title: 'Jurisdicción Abusiva', 
            description: 'La política impone tribunales extranjeros, dificultando la defensa del consumidor local.' 
          }
        ],
        summary: `AUDITORÍA FINALIZADA: El documento presenta riesgos legales elevados para el territorio Argentino.`,
        iaTraining: true,
        jurisdiction: "MENDOZA / ARGENTINA",
        details: { 
          complexity: "Muy Alta", 
          timestamp: new Date().toLocaleString('es-AR') 
        }
      };
      setResult(mockResult);
      setHistory(prev => [mockResult, ...prev]);
      setIsAuditing(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100">
      <Header onViewChange={setActiveView} />
      
      <main className="max-w-7xl mx-auto pt-32 pb-20 px-4">
        {activeView === 'audit' ? (
          <div className="grid grid-cols-12 gap-8">
            {/* Columna Izquierda */}
            <div className="col-span-12 xl:col-span-4 space-y-8">
              <Hero />
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-blue-900/5">
                <AuditTool onAudit={handleAudit} isAuditing={isAuditing} />
              </div>
            </div>

            {/* Columna Derecha (Resultados) */}
            <div className="col-span-12 xl:col-span-8">
              {!isAuditing && result ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <ResultsOverview 
                    result={result} 
                    onReset={() => setResult(null)} 
                    userTier={userTier} 
                    onExport={() => userTier ===
