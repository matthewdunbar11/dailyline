export const getPermissionsAsync = jest.fn();
export const requestPermissionsAsync = jest.fn();
export const scheduleNotificationAsync = jest.fn();
export const cancelAllScheduledNotificationsAsync = jest.fn();

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';
