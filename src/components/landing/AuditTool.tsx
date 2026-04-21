import React, { useState, useCallback } from 'react';
import { Shield, Upload, Link as LinkIcon, FileText, AlertCircle } from 'lucide-react';

const useTranslation = () => ({ 
  t: (key: string) => {
    const texts: any = {
      'auditTitle': 'Comenzar Peritaje',
      'dropZone': 'Arrastrá tus archivos aquí',
      'clickToBrowse': 'o hacé clic para buscar',
      'URLLABEL': 'URL de referencia',
      'RUNAUDIT': 'EJECUTAR AUDITORÍA',
      'inputPlaceholder': 'https://tiktok.com/legal/...'
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
  const [file, setFile] = useState<File | null>(null);
  const { t } = useTranslation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setInputValue('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-blue-600/10 p-2 rounded-lg text-blue-600">
          <Shield size={20} />
        </div>
        <h3 className="font-bold text-slate-900">{t('auditTitle')}</h3>
      </div>

      <div className="space-y-4">
        {/* Dropzone para archivos */}
        <div 
          onClick={() => document.getElementById('fileInput')?.click()}
          className={`
            border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer text-center
            ${file ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}
          `}
        >
          <input type="file" id="fileInput" className="hidden" onChange={handleFileChange} accept=".pdf,.txt" />
          <div className="flex flex-col items-center gap-2">
            <Upload className={file ? 'text-blue-600' : 'text-slate-400'} size={32} />
            {file ? (
              <p className="text-sm font-bold text-blue-600">{file.name}</p>
            ) : (
              <div>
                <p className="font-bold text-slate-700">{t('dropZone')}</p>
                <p className="text-xs text-slate-400">{t('clickToBrowse')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-5 flex items-center text-slate-400">
            <LinkIcon size={18} />
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (e.target.value) setFile(null);
            }}
            placeholder={t('inputPlaceholder')}
            className="w-full h-14 pl-12 pr-6 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-medium text-slate-600"
          />
        </div>

        <button
          onClick={() => {
            if (file) onAudit(file);
            else if (inputValue) onAudit(inputValue);
          }}
          disabled={isAuditing || (!inputValue && !file)}
          className={`
            w-full h-16 rounded-2xl font-black text-sm uppercase tracking-[0.2em]
            transition-all duration-300 flex items-center justify-center gap-3
            ${isAuditing || (!inputValue && !file)
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'}
          `}
        >
          {isAuditing ? <span>Analyzing...</span> : <span>{t('RUNAUDIT')}</span>}
        </button>
      </div>
    </div>
  );
}
