import React from 'react';
import { Shield } from 'lucide-react';

export default function Header({ onViewChange, isLoggedIn, onLogin, userPhoto }: any) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100 h-20">
      <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewChange('audit')}>
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><Shield size={24} /></div>
          <span className="text-xl font-black text-slate-900 tracking-tighter">ComplianceGuard<span className="text-blue-600">AI</span></span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onLogin}
            className="flex items-center gap-3 bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all active:scale-95 shadow-md"
          >
            {isLoggedIn && userPhoto && (
              <img src={userPhoto} alt="User" className="w-6 h-6 rounded-full border border-white/20" />
            )}
            {isLoggedIn ? 'Cerrar Sesión' : 'Entrar con Google'}
          </button>
        </div>
      </div>
    </header>
  );
}
