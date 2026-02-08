import { createInMemorySettingsRepository } from '../InMemorySettingsRepository';
import { getDefaultSettings, type UserSettings } from '../../types/settings';

const defaultSettings = getDefaultSettings();

describe('InMemorySettingsRepository', () => {
  it('returns default settings by default', async () => {
    const repository = createInMemorySettingsRepository();
    await expect(repository.getSettings()).resolves.toEqual(defaultSettings);
  });

  it('updates settings with partial values', async () => {
    const repository = createInMemorySettingsRepository();

    const updated = await repository.updateSettings({
      reminderEnabled: true,
      reminderHour: 7,
      theme: 'dark'
    });

    expect(updated).toEqual({
      ...defaultSettings,
      reminderEnabled: true,
      reminderHour: 7,
      theme: 'dark'
    });

    await expect(repository.getSettings()).resolves.toEqual(updated);
  });

  it('replaces settings when setSettings is called', async () => {
    const repository = createInMemorySettingsRepository();

    const replacement: UserSettings = {
      ...defaultSettings,
      timezone: 'America/Chicago',
      premiumStatus: 'premium'
    };

    await repository.setSettings(replacement);

    await expect(repository.getSettings()).resolves.toEqual(replacement);
  });
});
