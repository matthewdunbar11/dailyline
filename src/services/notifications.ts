import * as Notifications from 'expo-notifications';
import type { UserSettings } from '../types/settings';

export type ReminderPermissionStatus = 'granted' | 'denied' | 'undetermined' | 'unavailable';

export type ReminderScheduleResult = {
  permissionStatus: ReminderPermissionStatus;
  scheduled: boolean;
};

const mapPermissionStatus = (status: string): ReminderPermissionStatus => {
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
};

export const requestReminderPermission = async (): Promise<ReminderPermissionStatus> => {
  try {
    const current = await Notifications.getPermissionsAsync();
    const currentStatus = mapPermissionStatus(current.status);
    if (currentStatus === 'granted' || currentStatus === 'denied') {
      return currentStatus;
    }

    const requested = await Notifications.requestPermissionsAsync();
    return mapPermissionStatus(requested.status);
  } catch (error) {
    return 'unavailable';
  }
};

export const scheduleDailyReminder = async (settings: UserSettings): Promise<ReminderScheduleResult> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    return { permissionStatus: 'unavailable', scheduled: false };
  }

  if (!settings.reminderEnabled) {
    return { permissionStatus: 'undetermined', scheduled: false };
  }

  const permissionStatus = await requestReminderPermission();
  if (permissionStatus !== 'granted') {
    return { permissionStatus, scheduled: false };
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'DailyLine Reminder',
        body: 'Take a moment to write your daily line.'
      },
      trigger: {
        hour: settings.reminderHour,
        minute: settings.reminderMinute,
        repeats: true
      }
    });

    return { permissionStatus, scheduled: true };
  } catch (error) {
    return { permissionStatus: 'unavailable', scheduled: false };
  }
};
