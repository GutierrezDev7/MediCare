'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserPreferences,
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
  applyPreferences,
} from '@/lib/preferences';

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (partial: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const loaded = loadPreferences();
    setPreferences(loaded);
    applyPreferences(loaded);
  }, []);

  const updatePreferences = useCallback((partial: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const updated = savePreferences({ ...prev, ...partial });
      return updated;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    savePreferences(DEFAULT_PREFERENCES);
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences, resetPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
