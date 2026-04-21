import React from 'react';
import { User, Shield, Bell, CreditCard } from 'lucide-react';

const useTranslation = () => ({ 
  t: (key: string) => {
    const texts: any = {
      'settingsTitle': 'Configuración del Perfil',
      'settingsSub': 'Gestioná tu cuenta y preferencias de ComplianceGuard',
      'profileSection': 'Información Personal',
      'planSection': 'Suscripción y Créditos',
      'securitySection': 'Seguridad',
      'saveChanges': 'Guardar Cambios'
    };
    return texts[key] || key;
  }
});

export default function SettingsView() {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('settingsTitle')}</h2>
        <p className="text-slate-500">{t('settingsSub')}</p>
      </div>

      <div className="space-y-6">
        <div className="p-4 border border-slate-100 rounded-2xl flex items-center gap-4 hover:bg-slate-50 transition-colors">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><User size={20} /></div>
          <div><p className="font-bold text-slate-800">{t('profileSection')}</p><p className="text-sm text-slate-500">Actualizá tu nombre y correo.</p></div>
        </div>

        <div className="p-4 border border-slate-100 rounded-2xl flex items-center gap-4 hover:bg-slate-50 transition-colors">
          <div className="bg-purple-100 p-3 rounded-xl text-purple-600"><CreditCard size={20} /></div>
          <div><p className="font-bold text-slate-800">{t('planSection')}</p><p className="text-sm text-slate-500">Estás en el Plan Free (0 créditos).</p></div>
        </div>
      </div>

      <button className="mt-8 w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all">
        {t('saveChanges')}
      </button>
    </div>
  );
}
