import { executeSql, runSql } from '../db/sqlite';
import type { Entry } from '../types/entry';
import type { EntryRepository } from './EntryRepository';

const toEntry = (row: any): Entry => ({
  id: row.id,
  date: row.date,
  text: row.text,
  mood: row.mood ?? null,
  tags: row.tags ? JSON.parse(row.tags) : [],
  createdAt: row.createdAt,
  updatedAt: row.updatedAt
});

export const SQLiteEntryRepository: EntryRepository = {
  async getEntryByDate(date: string) {
    const result = await executeSql('SELECT * FROM entries WHERE date = ? LIMIT 1', [date]);
    if (result.rows.length === 0) {
      return null;
    }
    return toEntry(result.rows.item(0));
  },
  async upsertEntry(entry: Entry) {
    await runSql(
      `INSERT INTO entries (id, date, text, mood, tags, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(date) DO UPDATE SET
         text = excluded.text,
         mood = excluded.mood,
         tags = excluded.tags,
         updatedAt = excluded.updatedAt`,
      [
        entry.id,
        entry.date,
        entry.text,
        entry.mood ?? null,
        entry.tags ? JSON.stringify(entry.tags) : null,
        entry.createdAt,
        entry.updatedAt
      ]
    );
  },
  async listEntries() {
    const result = await executeSql('SELECT * FROM entries ORDER BY date DESC');
    const entries: Entry[] = [];
    for (let index = 0; index < result.rows.length; index += 1) {
      entries.push(toEntry(result.rows.item(index)));
    }
    return entries;
  },
  async getEntryDates() {
    const result = await executeSql('SELECT date FROM entries ORDER BY date DESC');
    const dates: string[] = [];
    for (let index = 0; index < result.rows.length; index += 1) {
      dates.push(result.rows.item(index).date);
    }
    return dates;
  }
};
