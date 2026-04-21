import React from 'react';
import { Shield, Settings, History, LayoutDashboard } from 'lucide-react';

const useTranslation = () => ({ 
  t: (key: string) => {
    const texts: any = {
      'navAudit': 'Auditoría',
      'navHistory': 'Historial',
      'navSettings': 'Configuración',
      'navLogin': 'Iniciar Sesión'
    };
    return texts[key] || key;
  }
});

export default function Header({ onViewChange }: { onViewChange: (view: string) => void }) {
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100 h-20">
      <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewChange('audit')}>
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <Shield size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900">
            ComplianceGuard<span className="text-blue-600">AI</span>
          </span>
        </div>

        <nav className="flex items-center gap-6">
          <button onClick={() => onViewChange('audit')} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
            <LayoutDashboard size={18} /> {t('navAudit')}
          </button>
          <button onClick={() => onViewChange('history')} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
            <History size={18} /> {t('navHistory')}
          </button>
          <button onClick={() => onViewChange('settings')} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
            <Settings size={18} /> {t('navSettings')}
          </button>
          <button className="ml-4 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-md">
            {t('navLogin')}
          </button>
        </nav>
      </div>
    </header>
  );
}
