import type { Entry } from '../types/entry';

export const filterEntries = (
  entries: Entry[],
  query: string,
  dateFilter?: string
): Entry[] => {
  const normalizedQuery = query.trim().toLowerCase();

  return entries.filter((entry) => {
    if (dateFilter && entry.date !== dateFilter) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    return entry.text.toLowerCase().includes(normalizedQuery);
  });
};
