import { Github, Slack, Code, ExternalLink, Zap } from 'lucide-react';
const useTranslation = () => ({ t: (key: string) => key });

export default function IntegrationsView() {
  const { t } = useTranslation();
  
  const integrations = [
    { name: 'Slack', icon: <Slack size={24} />, description: 'Send critical alerts directly to your legal channels.', status: 'Coming Soon' },
    { name: 'Jira', icon: <Zap size={24} />, description: 'Convert audit findings into action items automatically.', status: 'Coming Soon' },
    { name: 'GitHub', icon: <Github size={24} />, description: 'Scan privacy files on every PR to prevent legal drift.', status: 'Coming Soon' },
    { name: 'Generic Webhook', icon: <Code size={24} />, description: 'Connect to any internal compliance system.', status: 'Beta' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 h-full flex flex-col p-8 overflow-y-auto shadow-sm">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
          <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
          {t('integrations')}
        </h2>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 shadow-sm">
          Security Webhooks: 0 Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((item) => (
          <div 
            key={item.name}
            className="p-8 bg-white border border-slate-200 rounded-[2rem] transition-all hover:shadow-xl hover:border-slate-300 relative overflow-hidden group shadow-sm"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-600/20 transition-all">
                {item.icon}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm ${
                item.status === 'Beta' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'
              }`}>
                {item.status}
              </span>
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-2 truncate tracking-tight">{item.name}</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-black opacity-70 uppercase tracking-tighter">{item.description}</p>
            
            <button className="mt-10 w-full py-4 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 transition-all disabled:cursor-not-allowed shadow-inner" disabled>
              Configuration Protocol Locked <ExternalLink size={14} />
            </button>

            {item.status === 'Coming Soon' && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="bg-slate-900 text-white text-[10px] font-black px-6 py-3 rounded-2xl shadow-2xl uppercase tracking-widest">
                   Pipeline Initializing
                 </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-12 p-10 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 border-dashed text-center">
        <h4 className="text-sm font-black text-blue-900 mb-2">Custom API Integration?</h4>
        <p className="text-xs text-blue-600 font-bold italic opacity-80">Request access to the ComplianceGuard Private SDK for bespoke deployments.</p>
      </div>
    </div>
  );
}
