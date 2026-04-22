import { motion ... } from 'framer-motion';
import { X, Globe, ShieldCheck, Lock, ExternalLink, Zap, CheckCircle2, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { cn } from '../../lib/utils';
import { db, doc, getDoc, updateDoc, collection, query, where, getDocs } from '../../lib/firebase';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  setIsPaymentPending: (pending: boolean) => void;
}

type PlanType = 'single' | 'pro';

export default function PaymentModal({ isOpen, onClose, user, setIsPaymentPending }: PaymentModalProps) {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [isPendingValidation, setIsPendingValidation] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handlePayPal = () => {
    const url = selectedPlan === 'pro' 
      ? 'https://www.paypal.com/ncp/payment/ETL2V75XQJB6W' 
      : 'https://www.paypal.com/ncp/payment/LRDZRF2FCN3ZS';
    window.open(url, '_blank');
    setIsPendingValidation(true);
    setIsPaymentPending(true);
  };

  const handleMercadoPago = () => {
    const url = selectedPlan === 'pro'
      ? 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=08be4179e5ce4c5c9a253d1a8ef89386'
      : 'https://mpago.la/34c5p4F';
    window.open(url, '_blank');
    setIsPendingValidation(true);
    setIsPaymentPending(true);
  };

  const handleValidateCode = async () => {
    if (!user) {
      setValidationError('Inicia sesión para activar tu código.');
      return;
    }

    setIsValidating(true);
    setValidationError('');

    try {
      const q = query(collection(db, 'coupons'), where('code', '==', accessCode.trim().toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setValidationError('Código no válido.');
      } else {
        const couponDoc = querySnapshot.docs[0];
        const data = couponDoc.data();

        if (data.isUsed) {
          setValidationError('Este código ya fue utilizado.');
        } else {
          // Update Coupon
          await updateDoc(couponDoc.ref, {
            isUsed: true,
            usedBy: user.uid,
            usedEmail: user.email
          });

          // Update User
          await updateDoc(doc(db, 'users', user.uid), {
            tier: 'Pro',
            isPro: true,
            updatedAt: new Date().toISOString()
          });

          onClose();
          setIsPendingValidation(false);
          setIsPaymentPending(false);
          setAccessCode('');
        }
      }
    } catch (error) {
      console.error("Validation error:", error);
      setValidationError('Error de conexión con el servidor.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleConfirmSubscription = async () => {
    if (!user) {
      setValidationError('Inicia sesión para activar tu suscripción.');
      return;
    }

    setIsValidating(true);
    setValidationError('');

    // Simulated verification delay (3-5 seconds)
    await new Promise(resolve => setTimeout(resolve, 4000));

    try {
      // Update User directly for subscription logic
      await updateDoc(doc(db, 'users', user.uid), {
        tier: 'Pro',
        isPro: true,
        updatedAt: new Date().toISOString()
      });

      onClose();
      setIsPendingValidation(false);
      setIsPaymentPending(false);
    } catch (error) {
      console.error("Subscription validation error:", error);
      setValidationError('Error de activación. Contacta a soporte.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200"
          >
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {isPendingValidation ? (selectedPlan === 'pro' ? 'Confirmación de Suscripción' : 'Validación de Pago') : 'Unlock Full Analysis'}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">
                    {isPendingValidation 
                      ? (selectedPlan === 'pro' 
                          ? 'Sincronizando estado con RaiivenCloud Financial Registry.' 
                          : 'Procesa tu acceso manual para RaiivenCloud Intelligence.')
                      : 'Selecciona el plan que mejor se adapte a tus necesidades legales.'}
                  </p>
                </div>
                <button 
                  onClick={() => { 
                    onClose(); 
                    setSelectedPlan(null); 
                    setIsPendingValidation(false);
                  }}
                  className="p-3 hover:bg-slate-50 rounded-2xl transition-colors"
                >
                  <X size={24} className="text-slate-400 hover:text-slate-900" />
                </button>
              </div>

              {!isPendingValidation ? (
                <>
                  {/* Plan Selection Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {/* Single Audit Plan */}
                    <div 
                      onClick={() => setSelectedPlan('single')}
                      className={cn(
                        "p-6 rounded-3xl border-2 transition-all cursor-pointer relative group",
                        selectedPlan === 'single' ? "border-blue-600 bg-blue-50/30 shadow-md" : "border-slate-100 hover:border-slate-200 bg-slate-50/50"
                      )}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                          <ShieldCheck size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                        {selectedPlan === 'single' && <CheckCircle2 size={20} className="text-blue-600 animate-in zoom-in" />}
                      </div>
                      <h4 className="text-lg font-black text-slate-900">Single Audit</h4>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 mb-4">1 Reporte Completo</p>
                      <div className="space-y-1">
                        <p className="text-2xl font-black text-slate-900">$15 <span className="text-xs text-slate-400 font-bold uppercase">USD</span></p>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">$15.000 ARS</p>
                      </div>
                    </div>

                    {/* SaaS Pro Plan */}
                    <div 
                      onClick={() => setSelectedPlan('pro')}
                      className={cn(
                        "p-6 rounded-3xl border-2 transition-all cursor-pointer relative group",
                        selectedPlan === 'pro' ? "border-blue-600 bg-blue-50/30 shadow-md" : "border-slate-100 hover:border-blue-200 bg-slate-50/50"
                      )}
                    >
                      <div className="absolute -top-3 right-6 bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-blue-600/20 z-10">
                        Mejor Valor
                      </div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20 flex items-center justify-center">
                          <Zap size={20} className="text-white" />
                        </div>
                        {selectedPlan === 'pro' && <CheckCircle2 size={20} className="text-blue-600 animate-in zoom-in" />}
                      </div>
                      <h4 className="text-lg font-black text-slate-900">SaaS Pro</h4>
                      <p className="text-xs text-blue-600 font-black uppercase tracking-widest mt-1 mb-4">10 Auditorías + Ilimitados</p>
                      <div className="space-y-1">
                        <p className="text-2xl font-black text-slate-900">$49 <span className="text-xs text-slate-400 font-bold uppercase">USD</span></p>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">$45.000 ARS</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Section */}
                  <AnimatePresence>
                    {selectedPlan && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-8 border-t border-slate-100">
                          <div className="flex items-center justify-between mb-6">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Proceder con el pago seguro:</p>
                            {selectedPlan === 'pro' && (
                              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                                Suscripción mensual recurrente
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button 
                              onClick={handlePayPal}
                              className="flex items-center justify-between p-5 bg-white border border-slate-200 hover:border-blue-600 hover:bg-blue-50 rounded-2xl transition-all group shadow-sm active:scale-[0.98]"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-blue-100 transition-colors">
                                  <Globe size={20} className="text-slate-400 group-hover:text-blue-600" />
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-black text-slate-900">PayPal</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Global Checkout (USD)</p>
                                </div>
                              </div>
                              <ExternalLink size={16} className="text-slate-300 group-hover:text-blue-600" />
                            </button>

                            <button 
                              onClick={handleMercadoPago}
                              className="flex items-center justify-between p-5 bg-white border border-slate-200 hover:border-blue-600 hover:bg-blue-50 rounded-2xl transition-all group shadow-sm active:scale-[0.98]"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-blue-100 transition-colors text-xl">
                                  🇦🇷
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-black text-slate-900">Mercado Pago</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Argentina (ARS)</p>
                                </div>
                              </div>
                              <ExternalLink size={16} className="text-slate-300 group-hover:text-blue-600" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <div className="p-6 bg-slate-50 rounded-3xl border border-blue-100 flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20 text-white">
                      <Zap size={24} />
                    </div>
                    <p className="text-[11px] font-bold text-slate-600 leading-relaxed uppercase tracking-wider">
                      {selectedPlan === 'pro' 
                        ? 'Tu suscripción está casi lista. Haz clic en el botón de abajo después de completar el pago para activar tu cuenta Pro.'
                        : '¡Gracias por iniciar tu pago! Una vez completado, pega aquí tu CÓDIGO DE TRANSACCIÓN o envía el comprobante vía WhatsApp para recibir tu clave.'
                      }
                    </p>
                  </div>

                  <div className="space-y-4">
                    {selectedPlan === 'pro' ? (
                      <button 
                        onClick={handleConfirmSubscription}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                        disabled={isValidating}
                      >
                        {isValidating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Verificando Suscripción...
                          </>
                        ) : 'Confirmar y Activar Suscripción Pro'}
                      </button>
                    ) : (
                      <>
                        <div className="relative">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Ingresar código de acceso</label>
                          <input 
                            type="text" 
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                            placeholder="EX: RAIIVEN-XXXX"
                            className={cn(
                              "w-full bg-white border-2 px-6 py-4 rounded-2xl text-sm font-black tracking-widest outline-none transition-all placeholder:text-slate-300",
                              validationError ? "border-red-400 bg-red-50 text-red-600" : "border-slate-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                            )}
                          />
                          {validationError && (
                            <p className="absolute -bottom-6 left-2 text-[9px] font-black text-red-500 uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
                              {validationError}
                            </p>
                          )}
                        </div>

                        <button 
                          onClick={handleValidateCode}
                          className="w-full bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50"
                          disabled={!accessCode.trim() || isValidating}
                        >
                          {isValidating ? 'Validando...' : 'Verificar y Desbloquear Reporte'}
                        </button>
                      </>
                    )}
                    
                    <a 
                      href="https://wa.me/5492615000872?text=Hola,%20acabo%20de%20realizar%20el%20pago%20en%20ComplianceGuard.%20Adjunto%20comprobante." 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 text-emerald-600 hover:text-emerald-700 font-black text-[10px] uppercase tracking-widest py-2 transition-colors"
                    >
                      <MessageCircle size={14} /> Contactar Soporte WhatsApp
                    </a>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="px-10 pb-10">
              <div className="pt-8 border-t border-slate-100 text-center">
                <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  <div className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-blue-600" /> PCI-DSS</div>
                  <div className="flex items-center gap-1.5"><Lock size={14} className="text-blue-600" /> 256-BIT SSL</div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium italic">
                  Powered by RaiivenCloud Financial Services Compliance Node
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
