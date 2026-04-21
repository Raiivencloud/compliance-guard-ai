import React from 'react';
import { X, CreditCard, ShieldCheck, Zap } from 'lucide-react';
import { PayPalButtons } from "@paypal/react-paypal-js";

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
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={24} />
        </button>

        <div className="p-8 pt-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
            <Zap size={32} fill="currentColor" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Desbloqueá el Peritaje Completo</h2>
          <p className="text-slate-500 text-sm mb-8">Obtené acceso a todos los hallazgos detallados, análisis de riesgo legal y descarga de reporte oficial.</p>

          <div className="space-y-3 mb-8">
            {/* Botón de Mercado Pago */}
            <a 
              href="https://link.mercadopago.com.ar/tu_link" 
              target="_blank"
              className="w-full py-4 bg-[#009EE3] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#0089c7] transition-all shadow-lg shadow-blue-200"
            >
              <CreditCard size={20} />
              PAGAR CON MERCADO PAGO
            </a>

            {/* Contenedor de PayPal (El script lo llenará) */}
            <div id="paypal-button-container" className="min-h-[50px]">
               <PayPalButtons style={{ layout: "horizontal" }} onApprove={() => onSuccess()} />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <button 
              onClick={() => {
                const code = prompt("Ingresá tu código de activación:");
                if (code) onSuccess(code);
              }}
              className="w-full py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-blue-600 transition-colors"
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
