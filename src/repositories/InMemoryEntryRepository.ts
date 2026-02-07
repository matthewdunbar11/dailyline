import type { Entry } from '../types/entry';
import type { EntryRepository } from './EntryRepository';

export const createInMemoryEntryRepository = (seed: Entry[] = []): EntryRepository => {
  const entries = [...seed];

  return {
    async getEntryByDate(date: string) {
      return entries.find((entry) => entry.date === date) ?? null;
    },
    async upsertEntry(entry: Entry) {
      const index = entries.findIndex((existing) => existing.date === entry.date);
      if (index >= 0) {
        entries[index] = entry;
      } else {
        entries.push(entry);
      }
    },
    async listEntries() {
      return [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));
    },
    async getEntryDates() {
      return [...entries]
        .map((entry) => entry.date)
        .sort((a, b) => (a < b ? 1 : -1));
    }
  };
};
