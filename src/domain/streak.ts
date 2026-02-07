import { addDays, parseDateKey } from './date';
import type { Entry } from '../types/entry';

export type StreakResult = {
  current: number;
  longest: number;
};

const uniqueSortedDates = (entries: Entry[]): string[] => {
  const dates = Array.from(new Set(entries.map((entry) => entry.date)));
  return dates.sort((a, b) => parseDateKey(a).getTime() - parseDateKey(b).getTime());
};

export const calculateStreaks = (entries: Entry[], todayKey: string): StreakResult => {
  if (entries.length === 0) {
    return { current: 0, longest: 0 };
  }

  const dates = uniqueSortedDates(entries);
  let longest = 1;
  let currentRun = 1;

  for (let index = 1; index < dates.length; index += 1) {
    const expected = addDays(dates[index - 1], 1);
    if (dates[index] === expected) {
      currentRun += 1;
      longest = Math.max(longest, currentRun);
    } else {
      currentRun = 1;
    }
  }

  let current = 0;
  const lastDate = dates[dates.length - 1];
  if (lastDate === todayKey) {
    current = 1;
    for (let index = dates.length - 1; index > 0; index -= 1) {
      const expected = addDays(dates[index - 1], 1);
      if (dates[index] === expected) {
        current += 1;
      } else {
        break;
      }
    }
  }

  return { current, longest };
};
