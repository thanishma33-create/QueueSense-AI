import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  hospitalName: 'Govt. General Hospital — Central OPD Wing',
  hospitalMalayalam: 'ഗവണ്മെന്റ് ജനറൽ ഹോസ്പിറ്റൽ — ഒ.പി.ഡി വിഭാഗം',
  district: 'Ernakulam, Kerala',
  defaultLanguage: 'bilingual', // 'en', 'ml', 'bilingual'
  highContrastMode: false,
  autoAnnounceOnCall: true,
  playChimeSound: true,
  speechRate: 0.9,
  speechPitch: 1.0,
  speechVolume: 1.0,
  tvDisplayRotateIntervalSec: 15,
  privacyMaskLevel: 'standard', // 'standard' (Initials + Age), 'strict' (Token only)
  darkMode: false,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('queuesense_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem('queuesense_settings', JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const updateSettings = (partial) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const toggleHighContrast = () => {
    setSettings(prev => ({ ...prev, highContrastMode: !prev.highContrastMode }));
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      toggleDarkMode,
      toggleHighContrast,
      isMalayalamEnabled: settings.defaultLanguage === 'ml' || settings.defaultLanguage === 'bilingual',
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
