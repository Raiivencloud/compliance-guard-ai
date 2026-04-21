import React from 'react';
import { X, CreditCard, Zap, Star } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, onSuccess }: any) {
  if (!isOpen) return null;

  const handlePayment = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onSuccess();
    alert('Te redirigimos al pago. Al completar, el acceso se activará automáticamente.');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg"><Zap size={24} fill="currentColor" /></div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={20} className="text-slate-400" /></button>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Elegí tu Plan de Acceso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col">
              <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full uppercase w-fit">Pago Único</span>
              <h3 className="text-xl font-black text-slate-900 mt-2">Informe Único</h3>
              <div className="mt-auto space-y-3 pt-6">
                <button onClick={() => handlePayment("https://mpago.la/34c5p4F")} className="w-full h-12 bg-[#009EE3] text-white font-bold rounded-xl text-xs hover:brightness-105 transition-all">ARS $15.000</button>
                <button onClick={() => handlePayment("https://www.paypal.com/ncp/payment/LRDZRF2FCN3ZS")} className="w-full h-12 bg-[#003087] text-white font-bold rounded-xl text-xs hover:brightness-105 transition-all">USD $15</button>
              </div>
            </div>
            <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex flex-col relative overflow-hidden">
              <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase w-fit">Suscripción Pro</span>
              <h3 className="text-xl font-black text-slate-900 mt-2">Acceso Ilimitado</h3>
              <div className="mt-auto space-y-3 pt-6">
                <button onClick={() => handlePayment("https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=08be4179e5ce4c5c9a253d1a8ef89386")} className="w-full h-12 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-200">ARS $45.000/mes</button>
                <button onClick={() => handlePayment("https://www.paypal.com/ncp/payment/ETL2V75XQJB6W")} className="w-full h-12 bg-[#003087] text-white font-bold rounded-xl text-xs hover:brightness-105 transition-all">USD $49/mes</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
