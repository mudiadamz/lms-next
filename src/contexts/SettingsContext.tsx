import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SchoolSettings {
  schoolName: string;
  address: string;
  schoolLevel: 'sd' | 'smp' | 'sma' | '';
  darkMode: boolean;
}

interface SettingsContextType {
  settings: SchoolSettings;
  updateSettings: (newSettings: Partial<SchoolSettings>) => void;
  toggleDarkMode: () => void;
  isLoading: boolean;
}

const defaultSettings: SchoolSettings = {
  schoolName: 'LMS Sekolah',
  address: '',
  schoolLevel: '',
  darkMode: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SchoolSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('schoolSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        const loadedSettings = { ...defaultSettings, ...parsed };
        setSettings(loadedSettings);
        // Apply dark mode to document
        if (loadedSettings.darkMode) {
          document.documentElement.classList.add('dark-mode');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const updateSettings = (newSettings: Partial<SchoolSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('schoolSettings', JSON.stringify(updated));
    
    // Apply dark mode to document
    if (updated.darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  };

  const toggleDarkMode = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, toggleDarkMode, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

