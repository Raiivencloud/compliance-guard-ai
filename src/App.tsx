import React, { useState } from 'react';
import Header from './components/common/Header';
import Hero from './components/landing/Hero';
import AuditTool from './components/landing/AuditTool';
import ResultsOverview from './components/dashboard/ResultsOverview';
import HistoryView from './components/dashboard/HistoryView';
import SettingsView from './components/dashboard/SettingsView';

function App() {
  const [activeView, setActiveView] = useState('audit');
  const [isAuditing, setIsAuditing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Función principal de Auditoría
  const handleAudit = async (source: string | File) => {
    setIsAuditing(true);
    setResult(null); // Limpiamos pantalla para que se vea la carga

    // Simulamos el tiempo de procesamiento de la IA (3 segundos)
    setTimeout(() => {
      const mockResult = {
        score: 85,
        findings: [
          { 
            id: 1, 
            level: 'critical', 
            title: 'Datos Biométricos y Privacidad', 
            description: 'Se detectó recolección de huellas faciales y patrones de voz sin una cláusula clara de consentimiento para usuarios en Argentina.' 
          },
          { 
            id: 2, 
            level: 'warning', 
            title: 'Transferencia de Datos', 
            description: 'La política permite el envío de datos a servidores en jurisdicciones con estándares de protección menores a los locales.' 
          },
          { 
            id: 3, 
            level: 'info', 
            title: 'Derechos ARCO', 
            description: 'El documento detalla correctamente los pasos para solicitar la eliminación de datos, cumpliendo con la normativa estándar.' 
          }
        ],
        summary: `Análisis profundo completado con éxito para: ${typeof source === 'string' ? 'URL de Política' : source.name}. Se recomienda revisar las secciones marcadas en rojo para evitar sanciones legales.`,
        iaTraining: true,
        jurisdiction: "Internacional / Argentina",
        details: {
          complexity: "Alta",
          wordCount: "1,200+ palabras analizadas",
          timestamp: new Date().toLocaleTimeString()
        }
      };

      setResult(mockResult);
      // Guardamos en el historial para que la pestaña "Historial" no esté vacía
      setHistory(prev => [mockResult, ...prev]);
      setIsAuditing(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100">
      {/* Header con cambio de vista */}
      <Header onViewChange={setActiveView} />
      
      <main className="max-w-7xl mx-auto pt-32 pb-20 px-4">
        {activeView === 'audit' ? (
          /* Grilla de 12 columnas: 4 para el Hero/Tool y 8 para Resultados */
          <div className="grid grid-cols-12 gap-8">
            {/* Columna Izquierda: Hero y Herramienta */}
            <div className="col-span-12 xl:col-span-4 space-y-8">
              <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                <Hero />
              </div>
              <div className="bg
