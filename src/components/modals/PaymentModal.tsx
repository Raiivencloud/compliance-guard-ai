import React from 'react';
import { X, CreditCard, ShieldCheck, Zap, Star } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: boolean;
  onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, onSuccess }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
              <Zap size={24} fill="currentColor" />
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Desbloqueá el Reporte Full</h2>
            <p className="text-slate-500 font-medium">Obtené acceso inmediato a todas las métricas, riesgos legales detallados y exportación a PDF profesional.</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Análisis Legal Completo</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Cumplimiento Ley 25.326</p>
              </div>
            </div>
          </div>

          {/* BOTÓN DE PAGO DIRECTO */}
          <button
            onClick={() => {
              // Simulamos el pago exitoso directamente
              onSuccess();
              alert('¡Pago procesado con éxito! Desbloqueando herramientas Enterprise...');
            }}
            className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-3 mb-4"
          >
            <CreditCard size={20} />
            PAGAR Y DESBLOQUEAR AHORA
          </button>

          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">
            Pago seguro procesado por Mercado Pago / Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
