import React, { useState } from 'react';
import Header from './components/common/Header';
import Hero from './components/landing/Hero';
import AuditTool from './components/landing/AuditTool';
import ResultsOverview from './components/dashboard/ResultsOverview';
import HistoryView from './components/dashboard/HistoryView';
import SettingsView from './components/dashboard/SettingsView';

function App() {
  const [activeView, setActiveView] = useState('audit');

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onViewChange={setActiveView} />
      
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {activeView === 'audit' ? (
            <div className="space-y-20">
              <Hero />
              <AuditTool />
            </div>
          ) : activeView === 'history' ? (
            <HistoryView />
          ) : activeView === 'settings' ? (
            <SettingsView />
          ) : (
            <ResultsOverview />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
