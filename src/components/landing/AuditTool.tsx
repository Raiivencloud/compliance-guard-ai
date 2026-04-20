import React, { useState, useCallback } from 'react';
import { Upload, RefreshCw, Zap, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../hooks/useTranslation';

interface AuditToolProps {
  onAudit: (source: string | File) => void;
  isAuditing: boolean;
}

export default function AuditTool({ onAudit, isAuditing }: AuditToolProps) {
  const [url, setUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useTranslation();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      onAudit(file);
    }
  }, [onAudit]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAudit(file);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-12 transition-all flex flex-col items-center justify-center gap-4 group cursor-pointer",
          isDragging ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-500 bg-white hover:bg-slate-50 shadow-sm"
        )}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
          isDragging ? "bg-blue-600 text-white shadow-lg" : "bg-slate-100 text-slate-400 group-hover:text-blue-600 group-hover:bg-white group-hover:shadow-sm"
        )}>
          <Upload size={24} />
        </div>
        
        <div className="text-center">
          <p className="text-sm font-bold text-slate-900">{t('dropZone')}</p>
          <p className="text-xs text-slate-500 mt-1">{t('clickToBrowse')}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative group">
          <div className={cn(
            "absolute inset-y-0 left-4 flex items-center pointer-events-none transition-all duration-300",
            url ? "opacity-0 -translate-x-2" : "opacity-100 translate-x-0"
          )}>
             <Globe size={18} className="text-blue-600 mr-2" />
             <span className="text-slate-500 text-[11px] font-bold uppercase tracking-widest leading-none">{t('urlLabel')}</span>
          </div>
          <input
            type="url"
            placeholder={url ? "" : "https://api.openai.com/v1/..."}
            className={cn(
              "w-full h-14 bg-white border border-slate-200 rounded-xl text-sm font-medium transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm",
              url ? "pl-5" : "pl-36"
            )}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isAuditing}
          />
        </div>
        
        <button
          onClick={() => onAudit(url)}
          disabled={!url || isAuditing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-widest h-14 rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          {isAuditing ? (
            <>
              <RefreshCw className="animate-spin" size={18} />
              {t('auditing')}
            </>
          ) : (
            <>
              <Zap size={18} className="text-white" />
              {t('runAudit')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}


function Badge({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] uppercase tracking-wider font-bold text-slate-500">
      {icon}
      {label}
    </div>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
  );
}
