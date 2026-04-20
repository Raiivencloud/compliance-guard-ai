import { Shield, LayoutDashboard, History, Settings, Globe, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';
const useTranslation = () => ({ t: (key: string) => key });
import { cn } from '../../lib/utils';

type View = 'audit' | 'history' | 'policy' | 'integrations';

interface HeaderProps {
  activeView: View;
  onViewChange: (view: View) => void;
  isLoggedIn: boolean;
  userTier: 'Free' | 'Pro';
  onLogin: () => void;
  onLogout: () => void;
}

export default function Header({ activeView, onViewChange, isLoggedIn, userTier, onLogin, onLogout }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { t } = useTranslation();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 h-14 flex justify-between items-center fixed top-0 left-0 right-0 z-50 shrink-0 select-none shadow-sm">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onViewChange('audit')}>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-600/10 group-hover:scale-105 transition-transform">
          <Shield size={18} className="text-white" />
        </div>
        <span className="text-xl font-black tracking-tight text-slate-900">Compliance<span className="text-blue-600">Guard</span></span>
      </div>
      
      <nav className="hidden md:flex gap-1 items-center">
        {[
          { id: 'audit', icon: LayoutDashboard, label: t('audit') || 'Audit' },
          { id: 'history', icon: History, label: t('history') || 'History' },
          { id: 'policy', icon: Settings, label: t('settings') || 'Settings' },
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => onViewChange(item.id as View)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
              activeView === item.id 
                ? "bg-blue-50 text-blue-600" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon size={14} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Créditos disponibles:</span>
          <span className="text-[10px] font-black text-blue-600">{userTier === 'Pro' ? '∞' : '0'}</span>
        </div>
        
        {isLoggedIn ? (
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all px-2 py-1 rounded-xl shadow-sm group"
            >
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                alt="Avatar" 
                className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <div className="hidden lg:block text-left pr-1">
                <p className="text-[10px] font-black uppercase text-slate-400 leading-none">{userTier} Subscription</p>
                <p className="text-[10px] font-black text-slate-900 mt-1">Agustín Raiiven</p>
              </div>
              <ChevronDown size={12} className={cn("text-slate-400 transition-transform", showUserMenu && "rotate-180")} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden py-1 z-50">
                <div className="px-4 py-4 border-b border-slate-100 mb-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-black uppercase tracking-widest">Active</span>
                    <span className={cn(
                      "text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest",
                      userTier === 'Pro' ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                    )}>{userTier} Plan</span>
                  </div>
                  <p className="text-sm font-black text-slate-900">Agustín Raiiven</p>
                  <p className="text-xs text-slate-500 font-medium">agusgestro17@gmail.com</p>
                </div>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  <Settings size={14} /> Account Settings
                </button>
                <button 
                  onClick={() => { onLogout(); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors border-t border-slate-100"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={onLogin}
            className="flex items-center gap-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-blue-50 transition-all font-black text-[11px] uppercase tracking-widest px-4 h-10 rounded-xl shadow-sm active:scale-95 group"
          >
            <div className="p-1.5 bg-white border border-slate-100 rounded-lg shadow-sm">
              <svg width="14" height="14" viewBox="0 0 18 18">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.331C2.438 15.938 5.48 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.172.282-1.712V4.957H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.043l3.007-2.331z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.582C13.463.891 11.426 0 9 0 5.48 0 2.438 2.062.957 5.043l3.007 2.331C4.672 5.164 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
            </div>
            Sign in with Google
          </button>
        )}
      </div>
    </header>
  );
}

