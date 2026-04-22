import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Lock, Info } from 'lucide-react';
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
    bg: 'bg-red-50/80',
    border: 'border-red-200',
    badge: 'bg-red-600 text-white',
    label: 'Riesgo Crítico'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50/80',
    border: 'border-amber-200',
    badge: 'bg-amber-600 text-white',
    label: 'Advertencia'
  },
  safe: {
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50/80',
    border: 'border-emerald-200',
    badge: 'bg-emerald-600 text-white',
    label: 'Seguro'
  }
};

export default function FindingCard({ finding, isBlurred, userTier }: FindingCardProps) {
  // Salvavidas para evitar el crash si el level no coincide
  const safeLevel = (finding?.level && levelConfig[finding.level]) ? finding.level : 'warning';
  const config = levelConfig[safeLevel];

  if (!finding) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative p-6 rounded-2xl border shadow-sm transition-all mb-4",
        config.bg,
        config.border,
        isBlurred && "overflow-hidden"
      )}
    >
      <div className={cn("flex gap-5", isBlurred && "blur-[8px] select-none")}>
        {/* Icono Lateral */}
        <div className={cn("mt-1 p-3 rounded-xl bg-white shadow-sm h-fit", config.color)}>
          <config.icon size={22} strokeWidth={2.5} />
        </div>

        <div className="flex-1">
          {/* Header de la tarjeta */}
          <div className="flex items-center gap-3 mb-2.5">
            <span className={cn("text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm", config.badge)}>
              {config.label}
            </span>
            <span className="text-slate-500 text-xs font-bold bg-white/50 px-2 py-1 rounded-md border border-slate-100">
              {finding.category || finding.lawRef || 'Cumplimiento Legal'}
            </span>
          </div>

          {/* Título y Descripción con alto contraste */}
          <h4 className="text-slate-900 font-extrabold text-lg mb-2 tracking-tight">
            {finding.title || 'Hallazgo detectado'}
          </h4>
          <p className="text-slate-700 text-sm leading-relaxed mb-6 font-medium">
            {finding.description}
          </p>

          {/* Grid de Impacto y Esfuerzo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/80 p-3 rounded-xl border border-white/50 shadow-inner">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Impacto</span>
              <span className="text-sm font-bold text-slate-800">{finding.impact || 'Medio'}</span>
            </div>
            <div className="bg-white/80 p-3 rounded-xl border border-white/50 shadow-inner">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Esfuerzo</span>
              <span className="text-sm font-bold text-slate-800">{finding.effort || 'Bajo'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para usuarios Free */}
      {isBlurred && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/10 backdrop-blur-[1px]">
          <div className="bg-white p-5 rounded-2xl shadow-2xl border border-slate-200 flex flex-col items-center animate-in zoom-in-95 duration-300 max-w-[240px]">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-3">
              <Lock size={20} className="text-blue-600" />
            </div>
            <h5 className="text-slate-900 font-bold text-sm mb-1 uppercase tracking-tighter">Análisis Bloqueado</h5>
            <p className="text-slate-500 text-[11px] mb-4 leading-tight">Actualizá a Pro para desbloquear el informe completo y mitigar riesgos.</p>
            <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black rounded-xl transition-all shadow-lg shadow-blue-200">
              MEJORAR PLAN
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
