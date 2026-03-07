import React, { createContext, useContext, useState, useEffect } from 'react';
import translations, { getLanguages } from '../i18n';

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('openclaw-lang');
    if (saved && translations[saved]) return saved;
    const browser = navigator.language.split('-')[0];
    return translations[browser] ? browser : 'en';
  });

  useEffect(() => {
    localStorage.setItem('openclaw-lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, languages: getLanguages() }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

// Language selector component
export function LanguageSelector({ className = '' }) {
  const { language, setLanguage, languages } = useI18n();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      className={`bg-[#0D1321] border border-[#2A3142] rounded px-2 py-1 text-sm text-[#8892A8] hover:border-[#FF2D2D] transition-colors cursor-pointer ${className}`}
      data-testid="language-selector"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </select>
  );
}

export default I18nContext;
