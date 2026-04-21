import React, { useState } from 'react';
import { Shield, Upload, Link as LinkIcon, AlertCircle } from 'lucide-react';

const useTranslation = () => ({ 
  t: (key: string) => {
    const texts: any = {
      'auditTitle': 'Comenzar Peritaje',
      'dropZone': 'Arrastrá tus archivos aquí',
      'clickToBrowse': 'o hacé clic para buscar',
      'URLLABEL': 'URL de referencia',
      'RUNAUDIT': 'EJECUTAR AUDITORÍA',
      'inputPlaceholder': 'https://...'
    };
    return texts[key] || key;
  }
});

interface AuditToolProps {
  onAudit: (source: string | File) => void;
  isAuditing: boolean;
}

export default function AuditTool({ onAudit, isAuditing }: AuditToolProps) {
  const [inputValue, setInputValue] = useState('');
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-blue-600/10 p-2 rounded-lg text-blue-600">
          <LinkIcon size={20} />
        </div>
        <h3 className="font-bold text-slate-900">{t('auditTitle')}</h3>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t('inputPlaceholder')}
          className="w-full h-14 px-6 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-600"
        />

        <button
          onClick={() => {
            if (inputValue) onAudit(inputValue);
          }}
          disabled={isAuditing || !inputValue}
          className={`
            w-full h-16 rounded-2xl font-black text-sm uppercase tracking-[0.2em]
            transition-all duration-300 flex items-center justify-center gap-3
            ${isAuditing || !inputValue 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-[0.98]'}
          `}
        >
          {isAuditing ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing...</span>
            </div>
          ) : (
            <>
              <Shield size={20} />
              <span>{t('RUNAUDIT')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
