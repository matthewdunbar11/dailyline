export type UserSettings = {
  timezone: string;
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  theme: 'system' | 'light' | 'dark';
  premiumStatus: 'free' | 'premium';
  aiInsightsEnabled: boolean;
};

export const getDefaultSettings = (): UserSettings => {
  const resolvedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';

  return {
    timezone: resolvedTimezone,
    reminderEnabled: false,
    reminderHour: 9,
    reminderMinute: 0,
    theme: 'system',
    premiumStatus: 'free',
    aiInsightsEnabled: false
  };
};
