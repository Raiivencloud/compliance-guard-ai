import React, { useState } from 'react';
import Header from './components/common/Header';
import Hero from './components/landing/Hero';
import AuditTool from './components/landing/AuditTool';
import ResultsOverview from './components/dashboard/ResultsOverview';
import HistoryView from './components/dashboard/HistoryView';
import SettingsView from './components/dashboard/SettingsView';

function App() {
  const [activeView, setActiveView] = useState('audit');
  const [isAuditing, setIsAuditing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history] = useState<any[]>([]); 

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100">
      <Header onViewChange={setActiveView} />
      
      <main className="max-w-7xl mx-auto pt-32 pb-20 px-4">
        {activeView === 'audit' ? (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 xl:col-span-4 space-y-8">
              <Hero />
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
                <AuditTool onAudit={() => setIsAuditing(true)} isAuditing={isAuditing} />
              </div>
            </div>

            <div className="col-span-12 xl:col-span-8">
              <ResultsOverview 
                result={result} 
                onReset={() => setResult(null)} 
                userTier="Free"
              />
            </div>
          </div>
        ) : activeView === 'history' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <HistoryView history={history} onSelectResult={setResult} />
          </div>
        ) : (
          <SettingsView />
        )}
      </main>
    </div>
  );
}

export default App;
