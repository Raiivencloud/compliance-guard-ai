import { Clock, FileText, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import type { AuditResult } from '../../types';

interface HistoryViewProps {
  history: AuditResult[];
  onSelectResult: (result: AuditResult) => void;
}

export default function HistoryView({ history, onSelectResult }: HistoryViewProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-3xl border border-slate-200 h-full flex flex-col p-8 overflow-y-auto shadow-sm">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
          <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
          {t('history')}
        </h2>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 shadow-sm">
          Archived Scans: {history.length}
        </span>
      </div>

      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-6 animate-in fade-in duration-700">
          <div className="p-8 bg-slate-50 rounded-full border border-slate-100">
            <Clock size={64} strokeWidth={1} />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.3em]">No history recorded in this session</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((record, idx) => (
            <div 
              key={record.timestamp + idx}
              onClick={() => onSelectResult(record)}
              className="group p-6 bg-white border border-slate-200 rounded-[2rem] hover:border-blue-600 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer flex items-center justify-between shadow-sm active:scale-[0.99]"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all border border-slate-100 group-hover:border-blue-100">
                  <FileText size={28} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 truncate max-w-[300px] tracking-tight">{record.url || record.fileName || 'Unnamed Audit'}</h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest leading-none flex items-center gap-2">
                    <Clock size={10} />
                    {new Date(record.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-10">
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Risk Factor</p>
                  <p className={`text-2xl font-black ${record.score > 70 ? 'text-emerald-500' : record.score > 40 ? 'text-amber-500' : 'text-red-500'}`}>
                    {record.score}%
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 group-hover:bg-blue-600 group-hover:text-white transition-all border border-slate-100 group-hover:border-blue-600 shadow-sm">
                  <ArrowUpRight size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
