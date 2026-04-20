import { Settings, Check, Shield, Globe, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface PolicyEngineViewProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function PolicyEngineView() {
  const [activeLaws, setActiveLaws] = useState(['GDPR', 'EU AI ACT']);
  const { language, setLanguage, t } = useTranslation();
  
  const laws = [
    { id: 'GDPR', name: 'General Data Protection Regulation', region: 'Europe' },
    { id: 'EU AI ACT', name: 'Artificial Intelligence Act', region: 'Europe' },
    { id: 'CCPA', name: 'California Consumer Privacy Act', region: 'North America' },
    { id: 'PIPEDA', name: 'Personal Info Protection Act', region: 'Canada' },
    { id: 'LGPD', name: 'Lei Geral de Proteção de Dados', region: 'Brazil' },
  ];

  const toggleLaw = (id: string) => {
    setActiveLaws(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 h-full flex flex-col p-10 overflow-y-auto shadow-sm">
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
          <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
          {t('settings')} & Policy Engine
        </h2>
        <div className="flex items-center gap-2 bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
          <Settings size={14} />
          Engine v4.1 (Enterprise)
        </div>
      </div>

      <div className="space-y-16">
        {/* Language & Theme Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Globe size={16} className="text-blue-600" />
              Selector de Idioma
            </h3>
            <div className="flex gap-4">
              <button 
                onClick={() => setLanguage('es')}
                className={cn(
                  "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  language === 'es' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                )}
              >
                Español
              </button>
              <button 
                onClick={() => setLanguage('en')}
                className={cn(
                  "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  language === 'en' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                )}
              >
                English
              </button>
            </div>
          </div>

          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Sun size={16} className="text-blue-600" />
              Modo de Interfaz
            </h3>
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-700">Enterprise Light (Fijo)</span>
              <div className="w-10 h-5 bg-blue-600 rounded-full relative p-1">
                <div className="w-3 h-3 bg-white rounded-full absolute right-1" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <Shield size={16} className="text-blue-600" />
            Compliance Frameworks Activos
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {laws.map((law) => {
              const isActive = activeLaws.includes(law.id);
              return (
                <div 
                  key={law.id}
                  onClick={() => toggleLaw(law.id)}
                  className={cn(
                    "p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group",
                    isActive ? "border-blue-600 bg-blue-50/50 shadow-sm" : "border-slate-200 bg-white hover:border-blue-300"
                  )}
                >
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                      isActive ? "bg-blue-600 text-white shadow-lg" : "bg-slate-100 text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600"
                    )}>
                      <Shield size={24} />
                    </div>
                    <div>
                      <h4 className={cn("text-sm font-black transition-colors", isActive ? "text-blue-900" : "text-slate-600")}>{law.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{law.region}</span>
                        <span className="text-[9px] text-slate-300">•</span>
                        <span className="text-[9px] font-black text-blue-600/60 uppercase">{law.id}</span>
                      </div>
                    </div>
                  </div>
                  {isActive ? (
                    <div className="bg-blue-600 w-6 h-6 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/20 transition-all">
                      <Check size={14} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-slate-200 group-hover:border-blue-400 transition-all" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400 mb-2">Engine Logic Configuration</h4>
            <p className="text-sm text-slate-400 leading-relaxed max-w-lg mb-8 font-medium">ComplianceGuard Engine prioritizes legal risks by default. Ambiguity in policy drafting is flagged as Critical Exposure.</p>
            <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <span className="text-xs font-bold text-slate-200 tracking-tight">Análisis Detallado (Multi-Regulatorio)</span>
              <div className="w-12 h-6 bg-blue-600 rounded-full relative p-1 shadow-inner shadow-black/20">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 shadow-lg" />
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-2xl -ml-24 -mb-24" />
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
