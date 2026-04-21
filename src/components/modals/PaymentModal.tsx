import React from 'react';
import { X, CreditCard, ShieldCheck, Zap, ExternalLink, Star } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void; // Cambiado de boolean a función
  onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  if (!isOpen) return null;

  const handlePayment = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onSuccess();
    alert('Te redirigimos a la plataforma de pago. El reporte se desbloqueará en esta pestaña automáticamente.');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Fondo con Blur corregido */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
        onClick={onClose} 
      />
      
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
              <Zap size={24} fill="currentColor" />
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Elegí tu Plan de Acceso</h2>
            <p className="text-slate-500 font-medium">Desbloqueá el potencial de ComplianceGuard AI con pago local o internacional.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* INFORME ÚNICO */}
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col justify-between">
              <div className="mb-6">
                <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">Pago Único</span>
                <h3 className="text-xl font-black text-slate-900 mt-2">Informe Individual</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">Desbloqueá solo este análisis legal detallado.</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => handlePayment("https://mpago.la/34c5p4F")}
                  className="w-full h-12 bg-[#009EE3] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:brightness-105 transition-all"
                >
                  ARS $15.000
                </button>
                <button
                  onClick={() => handlePayment("https://www.paypal.com/ncp/payment/LRDZRF2FCN3ZS")}
                  className="w-full h-12 bg-[#003087] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:brightness-105 transition-all"
                >
                  USD $15
                </button>
              </div>
            </div>

            {/* SUSCRIPCIÓN PRO */}
            <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex flex-col justify-between relative">
              <div className="mb-6">
                <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">Suscripción Pro</span>
                <h3 className="text-xl font-black text-slate-900 mt-2">Acceso Ilimitado</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">Auditorías infinitas y soporte prioritario.</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => handlePayment("https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=08be4179e5ce4c5c9a253d1a8ef89386")}
                  className="w-full h-12 bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
                >
                  ARS $45.000 /mes
                </button>
                <button
                  onClick={() => handlePayment("https://www.paypal.com/ncp/payment/ETL2V75XQJB6W")}
                  className="w-full h-12 bg-[#003087] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:brightness-105 transition-all"
                >
                  USD $49 /mes
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">
            Seguridad garantizada por Mercado Pago y PayPal
          </p>
        </div>
      </div>
    </div>
  );
}
