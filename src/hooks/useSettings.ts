import { useState, useEffect, useCallback } from 'react';
import { getSettingsRepository } from '../repositories';
import { getDefaultSettings, type UserSettings } from '../types/settings';

type UseSettingsReturn = {
  settings: UserSettings | null;
  loading: boolean;
  error: Error | null;
  updateSettings: (update: Partial<UserSettings>) => Promise<UserSettings | null>;
  refreshSettings: () => Promise<void>;
};

export const useSettings = (): UseSettingsReturn => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const repository = await getSettingsRepository();
      const currentSettings = await repository.getSettings();
      setSettings(currentSettings);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load settings'));
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (update: Partial<UserSettings>): Promise<UserSettings | null> => {
    try {
      const repository = await getSettingsRepository();
      const updated = await repository.updateSettings(update);
      setSettings(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update settings'));
      return null;
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refreshSettings: loadSettings
  };
};
