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
    color: 'text-red-500',
    bg: 'bg-red-50/50',
    border: 'border-red-200',
    badge: 'bg-red-500 text-white',
    label: 'Riesgo Crítico'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-500',
    bg: 'bg-amber-50/50',
    border: 'border-amber-200',
    badge: 'bg-amber-500 text-white',
    label: 'Advertencia'
  },
  safe: {
    icon: CheckCircle,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50/50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-500 text-white',
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
        "relative p-6 rounded-2xl border transition-all shadow-sm mb-4",
        config.bg,
        config.border,
        isBlurred && "select-none overflow-hidden"
      )}
    >
      <div className={cn("flex gap-4", isBlurred && "blur-[6px]")}>
        <div className={cn("mt-1 p-2 rounded-xl bg-white shadow-sm", config.color)}>
          <config.icon size={20} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md", config.badge)}>
              {config.label}
            </span>
            <span className="text-slate-500 text-xs font-medium">
              {finding.category || finding.lawRef || 'Cumplimiento Normativo'}
            </span>
          </div>

          <h4 className="text-slate-900 font-bold text-lg mb-2">{finding.title}</h4>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">{finding.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Impacto</span>
              <span className="text-sm font-bold text-slate-700">{finding.impact || 'Medio'}</span>
            </div>
            <div className="bg-white/60 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Esfuerzo</span>
              <span className="text-sm font-bold text-slate-700">{finding.effort || 'Bajo'}</span>
            </div>
          </div>
        </div>
      </div>

      {isBlurred && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] p-6 text-center">
          <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center animate-in zoom-in-95 duration-300">
            <Lock size={24} className="text-blue-600 mb-2" />
            <span className="text-xs font-black uppercase tracking-tighter text-slate-900 mb-1">Contenido Bloqueado</span>
            <p className="text-[10px] text-slate-500 mb-3">Actualizá a Pro para desbloquear todos los hallazgos</p>
            <button className="bg-blue-600 text-white text-[10px] font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              MEJORAR PLAN
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
