import { initializeDatabase } from '../db/sqlite';
import { SQLiteEntryRepository } from './SQLiteEntryRepository';
import { SQLiteSettingsRepository } from './SQLiteSettingsRepository';

let initialized = false;

export const getEntryRepository = async () => {
  if (!initialized) {
    await initializeDatabase();
    initialized = true;
  }
  return SQLiteEntryRepository;
};

export const getSettingsRepository = async () => {
  if (!initialized) {
    await initializeDatabase();
    initialized = true;
  }
  return SQLiteSettingsRepository;
};
