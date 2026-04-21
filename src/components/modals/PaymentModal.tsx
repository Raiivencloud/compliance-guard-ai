import React from 'react';
import { X, Zap, MessageCircle, CreditCard } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, onSuccess }: any) {
  if (!isOpen) return null;

  const handleRedirect = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsApp = () => {
    const telefono = "5492615000872"; 
    const mensaje = window.encodeURIComponent("Hola Raiiven! Ya realicé el pago en ComplianceGuard. Te adjunto el comprobante para que me pases el código de activación.");
    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex justify-between mb-6">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
            <Zap size={24} fill="currentColor" />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 mb-2">Elegí tu Plan</h2>
        <p className="text-slate-500 mb-8 font-medium italic">Pagá y enviame el comprobante por WhatsApp para desbloquear el reporte.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={() => handleRedirect("https://mpago.la/34c5p4F")} className="p-6 bg-slate-50 rounded-3xl border hover:border-blue-500 transition-all text-left group">
            <span className="text-[10px] font-bold uppercase text-slate-400">Informe Único</span>
            <p className="font-black text-xl mt-1 text-slate-900 group-hover:text-blue-600">ARS $15.000</p>
          </button>
          <button onClick={() => handleRedirect("https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=08be4179e5ce4c5c9a253d1a8ef89386")} className="p-6 bg-blue-50 rounded-3xl border border-blue-100 hover:border-blue-500 transition-all text-left group">
            <span className="text-[10px] font-bold uppercase text-blue-600">Suscripción Mensual</span>
            <p className="font-black text-xl mt-1 text-slate-900 group-hover:text-blue-600">ARS $45.000</p>
          </button>
        </div>

        <div className="mt-8 space-y-3 pt-6 border-t border-slate-100">
          <button 
            onClick={handleWhatsApp}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 transition-all active:scale-95"
          >
            <MessageCircle size={20} /> ENVIAR COMPROBANTE WHATSAPP
          </button>
          
          <button 
            onClick={onSuccess} 
            className="w-full py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-blue-600 transition-colors"
          >
            TENGO UN CÓDIGO DE ACTIVACIÓN
          </button>
        </div>
      </div>
    </div>
  );
}
