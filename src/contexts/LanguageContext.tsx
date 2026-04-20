import React, { createContext, useContext, useState } from 'react';

// Creamos el contexto para el idioma
export const LanguageContext = createContext<any>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState('es');

  // Función de traducción simple
  const t = (key: string) => {
    const translations: any = {
      'header.login': 'Entrar',
      'hero.title': 'ComplianceGuard AI',
      'audit.button': 'Analizar ahora'
    };
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook personalizado para usar el idioma
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return { t: (k: string) => k, language: 'es' };
  }
  return context;
};
