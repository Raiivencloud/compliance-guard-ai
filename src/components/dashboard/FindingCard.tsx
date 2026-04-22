import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Info, Lock } from 'lucide-react';

interface FindingCardProps {
  finding: any;
  isBlurred?: boolean;
  userTier?: string;
}

const levelConfig: any = {
  critical: {
    icon: Shield,
    color: 'red',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
    label: 'Crítico'
  },
  warning: {
    icon: AlertTriangle,
    color: 'amber',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    label: 'Advertencia'
  },
  safe: {
    icon: CheckCircle,
    color: 'emerald',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    label: 'Seguro'
  }
};

export default function FindingCard({ finding, isBlurred, userTier }: FindingCardProps) {
  // BLINDAJE TOTAL: Si finding no existe o el level es raro, usamos 'warning' por defecto
  const safeLevel = (finding?.level && levelConfig[finding.level]) ? finding.level : 'warning';
  const config = levelConfig[safeLevel];

  if (!finding) return null;

  return (
    <div className={`relative p-5 rounded-2xl border transition-all duration-300 ${config.bg} ${config.border} ${isBlurred ? 'blur-md select-none' : ''}`}>
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-xl bg-black/40 ${config.text}`}>
          <config.icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/40 ${config.text}`}>
              {config.label}
            </span>
            <span className="text-slate-500 text-xs">{finding.category || 'General'}</span>
          </div>
          
          <h4 className="text-slate-200 font-semibold mb-2 leading-tight">
            {finding.title || 'Hallazgo detectado'}
          </h4>
          
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            {finding.description || 'No hay descripción disponible para este punto.'}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Impacto</span>
              <span className="text-sm text-slate-300 font-medium">{finding.impact || 'Medio'}</span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Esfuerzo</span>
              <span className="text-sm text-slate-300 font-medium">{finding.effort || 'Bajo'}</span>
            </div>
          </div>
        </div>
      </div>

      {isBlurred && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/20 backdrop-blur-sm rounded-2xl">
          <Lock className="w-8 h-8 text-brand-400 mb-3" />
          <h5 className="text-white font-bold mb-1 text-sm">Contenido Premium</h5>
          <p className="text-slate-400 text-[11px] mb-4 max-w-[180px]">
            Mejorá tu plan para ver el análisis detallado de este hallazgo.
          </p>
          <button className="px-4 py-2 bg-brand-500 text-white text-xs font-bold rounded-lg hover:bg-brand-600 transition-colors">
            Actualizar Plan
          </button>
        </div>
      )}
    </div>
  );
}
