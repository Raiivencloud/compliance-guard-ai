import React from 'react';
import { AlertTriangle, ShieldCheck, AlertCircle, Shield, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import type { AuditFinding, RiskLevel } from '../../types';

interface FindingCardProps {
  finding: AuditFinding;
  isBlurred: boolean;
  userTier: 'Free' | 'Pro';
}

const levelConfig: Record<RiskLevel, { 
  icon: React.ReactNode, 
  color: string, 
  bg: string, 
  border: string, 
  label: string 
}> = {
  critical: {
    icon: <AlertCircle size={20} />,
    color: 'text-red-500',
    bg: 'bg-red-50/50',
    border: 'border-red-100',
    label: 'Critical Risk'
  },
  warning: {
    icon: <AlertTriangle size={20} />,
    color: 'text-amber-500',
    bg: 'bg-amber-50/50',
    border: 'border-amber-100',
    label: 'Warning'
  },
  safe: {
    icon: <ShieldCheck size={20} />,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50/50',
    border: 'border-emerald-100',
    label: 'Secure'
  }
};

export default function FindingCard({ finding, isBlurred, userTier }: FindingCardProps) {
  const config = levelConfig[finding.level];

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 rounded-2xl border transition-all flex gap-6 group bg-white border-slate-200 hover:shadow-lg hover:border-slate-300 shadow-sm relative overflow-hidden",
        isBlurred && userTier === 'Free' && "select-none"
      )}
    >
      {isBlurred && userTier === 'Free' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/20 backdrop-blur-[6px]">
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center gap-3 shadow-2xl animate-in fade-in zoom-in duration-300">
            <Lock size={18} className="text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Upgrade to Unlock Findings</span>
          </div>
        </div>
      )}

      <div className={cn(
        "mt-1 shrink-0 p-3 rounded-xl bg-slate-50 transition-all", 
        config.color,
        isBlurred && userTier === 'Free' && "blur-[2px]"
      )}>
        {config.icon}
      </div>
      
      <div className={cn("flex-1", isBlurred && userTier === 'Free' && "blur-[5px]")}>
        <div className="flex justify-between items-start mb-3">
          <h4 className="text-sm font-black text-slate-900 tracking-tight">{finding.title}</h4>
          <span className={cn(
            "text-[9px] font-black uppercase px-2 py-1 rounded-md tracking-widest",
            finding.level === 'critical' ? "bg-red-50 text-red-600 border border-red-100" : finding.level === 'warning' ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
          )}>
            {config.label}
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          {finding.description}
        </p>
        
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-3 relative">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Shield size={12} className="text-blue-600" />
            Remediation Protocol
          </p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative group/rem">
            <p className={cn(
              "text-xs font-bold text-slate-600 italic leading-relaxed transition-all",
              userTier === 'Free' ? "blur-[3px] select-none" : "blur-0 select-auto"
            )}>
              {finding.recommendation}
            </p>
            {userTier === 'Free' && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50/40 rounded-xl">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <Lock size={10} className="text-slate-400" />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Locked for Free Tier</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

