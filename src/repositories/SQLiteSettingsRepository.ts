import { executeSql, runSql } from '../db/sqlite';
import { getDefaultSettings } from '../types/settings';
import type { UserSettings } from '../types/settings';
import type { SettingsRepository } from './SettingsRepository';

const SETTINGS_KEY = 'user_settings';

const normalizeSettings = (stored: Partial<UserSettings> | null): UserSettings => {
  return {
    ...getDefaultSettings(),
    ...(stored ?? {})
  };
};

const parseSettings = (value: string): UserSettings | null => {
  try {
    const parsed = JSON.parse(value) as Partial<UserSettings>;
    return normalizeSettings(parsed);
  } catch (error) {
    return null;
  }
};

const loadStoredSettings = async (): Promise<UserSettings | null> => {
  const result = await executeSql('SELECT value FROM settings WHERE key = ? LIMIT 1', [SETTINGS_KEY]);
  if (result.rows.length === 0) {
    return null;
  }

  return parseSettings(result.rows.item(0).value);
};

const saveSettings = async (settings: UserSettings): Promise<void> => {
  await runSql(
    `INSERT INTO settings (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [SETTINGS_KEY, JSON.stringify(settings)]
  );
};

export const SQLiteSettingsRepository: SettingsRepository = {
  async getSettings() {
    const stored = await loadStoredSettings();
    if (stored) {
      return stored;
    }

    const defaults = getDefaultSettings();
    await saveSettings(defaults);
    return defaults;
  },
  async updateSettings(update: Partial<UserSettings>) {
    const current = await this.getSettings();
    const merged = { ...current, ...update };
    await saveSettings(merged);
    return merged;
  },
  async setSettings(settings: UserSettings) {
    await saveSettings(settings);
  }
};
