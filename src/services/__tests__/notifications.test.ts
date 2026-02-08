import { scheduleDailyReminder } from '../notifications';

jest.mock('expo-notifications');

const Notifications = jest.requireMock('expo-notifications');

describe('scheduleDailyReminder', () => {
  beforeEach(() => {
    Notifications.getPermissionsAsync.mockReset();
    Notifications.requestPermissionsAsync.mockReset();
    Notifications.scheduleNotificationAsync.mockReset();
    Notifications.cancelAllScheduledNotificationsAsync.mockReset();
  });

  const baseSettings = {
    timezone: 'UTC',
    theme: 'system' as const,
    premiumStatus: 'free' as const,
    aiInsightsEnabled: false
  };

  it('cancels scheduled notifications when reminders are disabled', async () => {
    const result = await scheduleDailyReminder({
      ...baseSettings,
      reminderEnabled: false,
      reminderHour: 9,
      reminderMinute: 0
    });

    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    expect(result).toEqual({ permissionStatus: 'undetermined', scheduled: false });
  });

  it('schedules a daily reminder when permission is granted', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });

    const result = await scheduleDailyReminder({
      ...baseSettings,
      reminderEnabled: true,
      reminderHour: 7,
      reminderMinute: 30
    });

    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
      content: {
        title: 'DailyLine Reminder',
        body: 'Take a moment to write your daily line.'
      },
      trigger: {
        hour: 7,
        minute: 30,
        repeats: true
      }
    });
    expect(result).toEqual({ permissionStatus: 'granted', scheduled: true });
  });

  it('does not schedule when permission is denied', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' });

    const result = await scheduleDailyReminder({
      ...baseSettings,
      reminderEnabled: true,
      reminderHour: 18,
      reminderMinute: 15
    });

    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    expect(result).toEqual({ permissionStatus: 'denied', scheduled: false });
  });
});
