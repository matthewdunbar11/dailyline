import type { Entry } from '../types/entry';

export type EntryRepository = {
  getEntryByDate(date: string): Promise<Entry | null>;
  upsertEntry(entry: Entry): Promise<void>;
  listEntries(): Promise<Entry[]>;
  getEntryDates(): Promise<string[]>;
};
