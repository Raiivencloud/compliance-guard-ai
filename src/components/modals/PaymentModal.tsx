import React from 'react';
import { X, CreditCard, Zap, CheckCircle } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, onSuccess }: any) {
  if (!isOpen) return null;

  const handlePaymentRedirect = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    alert('Se abrió la pestaña de pago. Cuando termines, volvé y confirmá tu pago para desbloquear el reporte.');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg"><Zap size={24} fill="currentColor" /></div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={20} className="text-slate-400" /></button>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 text-center">Desbloqueá el Reporte Full</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col">
              <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full uppercase w-fit">Pago Único</span>
              <h3 className="text-xl font-black text-slate-900 mt-2">Informe Único</h3>
              <div className="mt-6 space-y-3">
                <button onClick={() => handlePaymentRedirect("https://mpago.la/34c5p4F")} className="w-full h-12 bg-[#009EE3] text-white font-bold rounded-xl text-xs">ARS $15.000</button>
                <button onClick={() => handlePaymentRedirect("https://www.paypal.com/ncp/payment/LRDZRF2FCN3ZS")} className="w-full h-12 bg-[#003087] text-white font-bold rounded-xl text-xs">USD $15</button>
              </div>
            </div>
            <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex flex-col">
              <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase w-fit">Suscripción Pro</span>
              <h3 className="text-xl font-black text-slate-900 mt-2">Acceso Ilimitado</h3>
              <div className="mt-6 space-y-3">
                <button onClick={() => handlePaymentRedirect("https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=08be4179e5ce4c5c9a253d1a8ef89386")} className="w-full h-12 bg-blue-600 text-white font-bold rounded-xl text-xs">ARS $45.000/mes</button>
                <button onClick={() => handlePaymentRedirect("https://www.paypal.com/ncp/payment/ETL2V75XQJB6W")} className="w-full h-12 bg-[#003087] text-white font-bold rounded-xl text-xs">USD $49/mes</button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <button 
              onClick={onSuccess} 
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3"
            >
              <CheckCircle size={20} />
              YA REALICÉ MI PAGO / CONFIRMAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
