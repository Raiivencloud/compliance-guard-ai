import React, { useEffect } from 'react';
import { X, CreditCard, Zap, MessageCircle } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, onSuccess }: any) {
  useEffect(() => {
    if (isOpen && !document.getElementById('paypal-sdk')) {
      const script = document.createElement('script');
      script.id = 'paypal-sdk';
      script.src = "https://www.paypal.com/sdk/js?client-id=test&currency=USD"; // Reemplazá 'test' por tu ID real
      script.onload = () => {
        if ((window as any).paypal) {
          (window as any).paypal.Buttons({
            style: { layout: 'horizontal', shape: 'pill' },
            onApprove: () => onSuccess()
          }).render('#paypal-button-container');
        }
      };
      document.body.appendChild(script);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 pt-12 text-center relative shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X size={24} /></button>
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg"><Zap size={32} fill="currentColor" /></div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Elegí tu Plan</h2>
        <div className="space-y-3 mb-8">
          <a href="https://mpago.la/34c5p4F" target="_blank" rel="noreferrer" className="w-full py-4 bg-[#009EE3] text-white rounded-2xl font-bold flex items-center justify-center gap-3">
            <CreditCard size={20} /> MERCADO PAGO
          </a>
          <div id="paypal-button-container"></div>
          <button onClick={() => window.open('https://wa.me/5492615000872')} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3">
            <MessageCircle size={20} /> WHATSAPP
          </button>
        </div>
        <button 
          onClick={() => {
            const code = prompt("Ingresá tu código:");
            if (code) onSuccess(code);
          }}
          className="w-full py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-blue-600"
        >
          TENGO UN CÓDIGO DE ACTIVACIÓN
        </button>
      </div>
    </div>
  );
}
