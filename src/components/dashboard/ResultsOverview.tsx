import { motion } from 'framer-motion';
import { Download, RefreshCw, ShieldCheck, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';
import FindingCard from './FindingCard';
import { useTranslation } from '../../hooks/useTranslation';
import type { AuditResult } from '../../types';

interface ResultsOverviewProps {
  result: AuditResult;
  onReset: () => void;
  onExport: () => void;
  userTier: 'Free' | 'Pro';
  isPaymentPending?: boolean;
}

export default function ResultsOverview({ result, onReset, onExport, userTier, isPaymentPending }: ResultsOverviewProps) {
  const { t } = useTranslation();

  if (!result || !result.findings || result.findings.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 h-full flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-500 shadow-sm">
        <div className="mb-6 bg-slate-50 p-6 rounded-full">
          <Shield size={48} className="text-slate-300" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Esperando análisis...</h2>
        <p className="text-slate-500 max-w-xs font-medium">Ingresa una URL o sube un documento para iniciar la auditoría de cumplimiento.</p>
        <button 
          onClick={onReset}
          className="mt-8 px-6 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
        >
          {t('reset') || 'Recargar'}
        </button>
      </div>
    );
  }

  const criticalCount = result.findings.filter(f => f.level === 'critical').length;
  const warningCount = result.findings.filter(f => f.level === 'warning').length;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 h-full flex flex-col p-8 overflow-y-auto shadow-sm">
      {/* Monetization Banner (Only for Free users or Pending Payments) */}
      {(userTier === 'Free' || isPaymentPending) && (
        <div className={cn(
          "mb-6 p-4 rounded-2xl flex items-center justify-between text-white shadow-lg animate-in slide-in-from-top-4 duration-500",
          isPaymentPending ? "bg-amber-500 shadow-amber-500/20" : "bg-blue-600 shadow-blue-600/20"
        )}>
          <div className="flex items-center gap-3">
            {isPaymentPending ? (
              <RefreshCw size={20} className="text-amber-100 animate-spin" />
            ) : (
              <ShieldCheck size={20} className="text-blue-200" />
            )}
            <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
              {isPaymentPending 
                ? "Esperando confirmación de pago... El reporte se desbloqueará en breve"
                : "Versión de previsualización limitada. El informe completo incluye mapeo legal GDPR/AIA y pasos de mitigación técnica."
              }
            </p>
          </div>
          {!isPaymentPending && (
            <button 
              onClick={onExport}
              className="bg-white text-blue-600 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-md active:scale-95"
            >
              Upgrade Now
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-100">
        <div className="flex items-center gap-6">
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="44"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-100"
              />
              <circle
                cx="48"
                cy="48"
                r="44"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - result.score / 100)}`}
                className={cn(
                   "transition-all duration-1000 ease-out",
                   result.score > 70 ? 'text-emerald-500' : result.score > 40 ? 'text-amber-500' : 'text-red-500'
                )}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900 leading-none">{result.score}</span>
              <span className="text-[8px] font-black uppercase text-slate-400 mt-1">Score</span>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('complianceScore')}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={cn(
                "w-2 h-2 rounded-full",
                result.score > 70 ? 'bg-emerald-500' : result.score > 40 ? 'bg-amber-500' : 'bg-red-500'
              )}></span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {result.score > 70 ? 'Satisfactory' : result.score > 40 ? 'Needs Attention' : 'Critical Failure'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onReset}
            className="p-3 text-slate-400 hover:text-slate-900 transition-colors border border-slate-100 rounded-xl"
          >
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={onExport}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Download size={14} />
            {userTier === 'Pro' ? 'Descargar Reporte PDF' : 'Unlock Full Legal Report'}
          </button>
        </div>
      </div>

      <div className="space-y-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex flex-col shadow-sm">
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">{t('criticalRisks')}</span>
              <span className="text-2xl font-black text-red-600">{criticalCount}</span>
           </div>
           <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex flex-col shadow-sm">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">{t('advisoryWarnings')}</span>
              <span className="text-2xl font-black text-amber-600">{warningCount}</span>
           </div>
           <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('aiTraining')}</span>
              <span className="text-xs font-black text-slate-900 uppercase mt-1">{result.iaTraining ? 'In Use' : 'No Evidence'}</span>
           </div>
           <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('jurisdiction')}</span>
              <span className="text-xs font-black text-slate-900 uppercase mt-1 truncate">{result.jurisdiction}</span>
           </div>
        </div>

        <div>
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
             <ShieldCheck size={14} className="text-blue-600" />
             {t('execSummary')}
           </h3>
           <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl text-slate-700 leading-relaxed font-medium italic shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-50" />
             {result.summary}
           </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Shield size={14} className="text-blue-600" />
              {t('anomalies')}
            </h3>
            <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{result.findings.length} Hallazgos</span>
          </div>
          <div className="space-y-4">
    {result.findings?.map((finding, index) => (
  <div key={finding.id || `f-${index}`} className="animate-in slide-in-from-bottom-2 duration-300 fill-mode-both">
    <FindingCard 
      finding={{
        ...finding,
        color: finding.color || 'blue'
      }}
      isBlurred={userTier === 'Free' ? index > 0 : false}
      userTier={userTier}
    />
  </div>
))}
        </div>
      </div>
    </div>
  );
}function FilterBadge({ label, active }: { label: string, active?: boolean }) {
  return (
    <button className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
      active 
        ? "bg-brand-500 text-white" 
        : "bg-white/5 text-slate-500 border border-white/5 hover:border-white/10"
    }`}>
      {label}
    </button>
  );
}
