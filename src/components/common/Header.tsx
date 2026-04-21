import React, { useState } from 'react';
import { Shield, Menu, X, User, LogOut, Settings, History, LayoutDashboard } from 'lucide-react';

const useTranslation = () => ({ 
  t: (key: string) => {
    const texts: any = {
      'navAudit': 'Auditoría',
      'navHistory': 'Historial',
      'navSettings': 'Configuración',
      'navPricing': 'Precios',
      'navLogin': 'Iniciar Sesión',
      'navLogout': 'Cerrar Sesión'
    };
    return texts[key] || key;
  }
});

interface HeaderProps {
  onViewChange: (view: string) => void;
}

export default function Header({ onViewChange }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();

  const navigation = [
    { id: 'audit', icon: Shield, label: t('navAudit') },
    { id: 'history', icon: History, label: t('navHistory') },
    { id: 'settings', icon: Settings, label: t('navSettings') }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewChange('audit')}>
            <div className="bg-blue-600 p-2 rounded-xl">
              <Shield className="text-white" size={24} />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">ComplianceGuard<span className="text-blue-600">AI</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
            <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all">
              {t('navLogin')}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
