import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { settingsService, SchoolSettings } from '../services/settingsService';

interface SettingsContextType {
  settings: SchoolSettings;
  updateSettings: (newSettings: Partial<SchoolSettings>) => Promise<void>;
  toggleDarkMode: () => Promise<void>;
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
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        // Check if user is authenticated by checking token
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const loadedSettings = await settingsService.getSettings();
            setSettings(loadedSettings);
            // Apply dark mode to document
            if (loadedSettings.darkMode) {
              document.documentElement.classList.add('dark-mode');
            } else {
              document.documentElement.classList.remove('dark-mode');
            }
          } catch (error) {
            console.error('Error loading settings from API:', error);
            // Fallback to default settings on error
            setSettings(defaultSettings);
          }
        } else {
          // Use default settings if not authenticated
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        // Fallback to default settings on error
        setSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
    
    // Reload settings when auth state changes (listen to storage events)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        loadSettings();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen to custom event for same-tab auth changes
    const handleAuthChange = () => {
      loadSettings();
    };
    
    window.addEventListener('auth-changed', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, []);

  const updateSettings = async (newSettings: Partial<SchoolSettings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      
      // Update via API if authenticated
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // If updating dark mode, use specific endpoint
          if (newSettings.darkMode !== undefined) {
            await settingsService.updateDarkMode(newSettings.darkMode);
          } else {
            // Update other settings (admin only)
            await settingsService.updateSettings(newSettings);
          }
        } catch (error) {
          console.error('Error updating settings via API:', error);
          // Don't throw - allow local update to proceed
        }
      }
      
      // Apply dark mode to document
      if (updated.darkMode) {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const toggleDarkMode = async () => {
    await updateSettings({ darkMode: !settings.darkMode });
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

