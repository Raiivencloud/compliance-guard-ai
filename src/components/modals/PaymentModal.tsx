import React from 'react';
import { X, CreditCard, Zap, MessageCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (code?: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>

        <div className="p-8 pt-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
            <Zap size={32} fill="currentColor" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Elegí tu Plan</h2>
          <p className="text-slate-500 text-sm mb-8">Pagá y desbloqueá el reporte legal completo al instante.</p>

          <div className="space-y-3 mb-8">
            {/* Mercado Pago */}
            <a href="https://mpago.la/34c5p4F" target="_blank" rel="noreferrer" className="w-full py-4 bg-[#009EE3] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90">
              PAGAR CON MERCADO PAGO
            </a>

            {/* Contenedor para PayPal (se llena por el script en App.tsx) */}
            <div id="paypal-button-container"></div>

            <button onClick={() => window.open('https://wa.me/5492615000872', '_blank')} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3">
              <MessageCircle size={20} /> ENVIAR COMPROBANTE WHATSAPP
            </button>
          </div>

          <div className="border-t pt-6">
            <button 
              onClick={() => {
                const code = prompt("Ingresá tu código de activación:");
                if (code) onSuccess(code);
              }}
              className="w-full py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-blue-600"
            >
              TENGO UN CÓDIGO DE ACTIVACIÓN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
