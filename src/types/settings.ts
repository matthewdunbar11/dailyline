export type UserSettings = {
  timezone: string;
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  theme: 'system' | 'light' | 'dark';
  premiumStatus: 'free' | 'premium';
  aiInsightsEnabled: boolean;
};
