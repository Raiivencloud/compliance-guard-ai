import React from 'react';
import { X, Zap, MessageCircle, CheckCircle } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, onSuccess }: any) {
  if (!isOpen) return null;

  const handleRedirect = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8">
        <div className="flex justify-between mb-6">
          <div className="bg-blue-600 p-3 rounded-2xl text-white"><Zap size={24} fill="currentColor" /></div>
          <button onClick={onClose} className="p-2"><X size={20} /></button>
        </div>
        
        <h2 className="text-3xl font-black mb-8">Elegí tu Plan</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={() => handleRedirect("https://mpago.la/34c5p4F")} className="p-6 bg-slate-50 rounded-3xl border hover:border-blue-500 transition-all text-left">
            <span className="text-[10px] font-bold uppercase text-slate-400">Pago Único</span>
            <p className="font-black text-xl mt-1 text-slate-900">ARS $15.000</p>
          </button>
          <button onClick={() => handleRedirect("https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=08be4179e5ce4c5c9a253d1a8ef89386")} className="p-6 bg-blue-50 rounded-3xl border border-blue-100 hover:border-blue-500 transition-all text-left">
            <span className="text-[10px] font-bold uppercase text-blue-600">Suscripción</span>
            <p className="font-black text-xl mt-1 text-slate-900">ARS $45.000</p>
          </button>
        </div>

        <div className="mt-8 space-y-3">
          <button 
            onClick={() => window.open("https://wa.me/TU_NUMERO_AQUÍ?text=Hola! Ya pagué, adjunto comprobante", "_blank")}
            className="w-full py-4 bg-emerald-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg"
          >
            <MessageCircle size={20} /> ENVIAR COMPROBANTE WHATSAPP
          </button>
          <button onClick={onSuccess} className="w-full py-2 text-slate-400 font-bold text-xs">
            TENGO UN CÓDIGO DE ACTIVACIÓN
          </button>
        </div>
      </div>
    </div>
  );
}
