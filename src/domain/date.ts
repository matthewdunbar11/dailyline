export const formatDateKey = (date: Date, timeZone?: string): string => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date);
};

export const getTodayKey = (timeZone?: string): string => {
  return formatDateKey(new Date(), timeZone);
};

export const isToday = (dateKey: string, timeZone?: string): boolean => {
  return dateKey === getTodayKey(timeZone);
};

export const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const addDays = (dateKey: string, days: number): string => {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
};
