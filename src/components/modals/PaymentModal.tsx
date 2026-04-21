import React from 'react';
import { X, CreditCard, Zap, MessageCircle } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, onSuccess }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 pt-12 text-center relative shadow-2xl animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>

        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-blue-200">
          <Zap size={32} fill="currentColor" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Desbloqueá el Peritaje</h2>
        <p className="text-slate-500 text-sm mb-8">Obtené el reporte legal detallado y los hallazgos de riesgo.</p>

        <div className="space-y-3 mb-8">
          <a href="https://mpago.la/34c5p4F" target="_blank" rel="noreferrer" className="w-full py-4 bg-[#009EE3] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all">
            <CreditCard size={20} /> PAGAR CON MERCADO PAGO
          </a>

          {/* ESTE CONTENEDOR ES CLAVE PARA QUE PAYPAL APAREZCA */}
          <div id="paypal-button-container" className="min-h-[50px]"></div>

          <button onClick={() => window.open('https://wa.me/5492615000872')} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3">
            <MessageCircle size={20} /> ENVIAR COMPROBANTE WHATSAPP
          </button>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <button 
            onClick={() => {
              const code = prompt("Ingresá tu código de activación:");
              if (code) onSuccess(code);
            }}
            className="w-full py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-colors"
          >
            TENGO UN CÓDIGO DE ACTIVACIÓN
          </button>
        </div>
      </div>
    </div>
  );
}
