import { initializeDatabase } from '../db/sqlite';
import { SQLiteEntryRepository } from './SQLiteEntryRepository';

let initialized = false;

export const getEntryRepository = async () => {
  if (!initialized) {
    await initializeDatabase();
    initialized = true;
  }
  return SQLiteEntryRepository;
};
