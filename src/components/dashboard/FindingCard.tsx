import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface FindingCardProps {
  finding: any;
  isBlurred?: boolean;
  userTier?: string;
}

const levelConfig: any = {
  critical: {
    icon: Shield,
    color: 'text-red-600',
    bg: 'bg-red-50/90',
    border: 'border-red-200',
    badge: 'bg-red-600 text-white',
    label: 'Riesgo Crítico'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-700',
    bg: 'bg-amber-50/90',
    border: 'border-amber-200',
    badge: 'bg-amber-600 text-white',
    label: 'Advertencia'
  },
  safe: {
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50/90',
    border: 'border-emerald-200',
    badge: 'bg-emerald-600 text-white',
    label: 'Seguro'
  }
};

export default function FindingCard({ finding, isBlurred, userTier }: FindingCardProps) {
  const safeLevel = (finding?.level && levelConfig[finding.level]) ? finding.level : 'warning';
  const config = levelConfig[safeLevel];

  if (!finding) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative p-6 rounded-2xl border shadow-sm transition-all mb-5",
        config.bg,
        config.border
      )}
    >
      <div className={cn("flex gap-5", isBlurred && "blur-[8px] select-none")}>
        {/* Icono con fondo blanco para que resalte */}
        <div className={cn("mt-1 p-3 rounded-xl bg-white shadow-md h-fit shrink-0", config.color)}>
          <config.icon size={24} strokeWidth={2.5} />
        </div>

        <div className="flex-1">
          {/* Header con Badges */}
          <div className="flex items-center gap-3 mb-3">
            <span className={cn("text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm", config.badge)}>
              {config.label}
            </span>
            <span className="text-slate-500 text-[10px] font-bold bg-white/60 px-2 py-1 rounded border border-slate-200/50">
              {finding.category || finding.lawRef || 'Normativa Legal'}
            </span>
          </div>

          {/* Texto Principal - AQUÍ ESTÁ EL CAMBIO DE VISIBILIDAD */}
          <h4 className="text-slate-900 font-extrabold text-xl mb-2 tracking-tight">
            {finding.title}
          </h4>
          <p className="text-slate-700 text-sm leading-relaxed mb-6 font-medium">
            {finding.description}
          </p>

          {/* Indicadores de Impacto */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/70 p-3 rounded-xl border border-white shadow-inner">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Impacto</span>
              <span className="text-sm font-bold text-slate-800">{finding.impact || 'Medio'}</span>
            </div>
            <div className="bg-white/70 p-3 rounded-xl border border-white shadow-inner">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Esfuerzo</span>
              <span className="text-sm font-bold text-slate-800">{finding.effort || 'Bajo'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay de Bloqueo Pro */}
      {isBlurred && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-slate-200 flex flex-col items-center animate-in zoom-in-95 duration-300 max-w-[260px] text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <Lock size={24} className="text-blue-600" />
            </div>
            <h5 className="text-slate-900 font-black text-sm mb-2 uppercase tracking-tighter">Análisis Restringido</h5>
            <p className="text-slate-500 text-[11px] mb-5 leading-tight font-medium">Este hallazgo requiere una suscripción Pro para visualizar los pasos de mitigación.</p>
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95">
              DESBLOQUEAR AHORA
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
