import * as SQLite from 'expo-sqlite';
import { createTablesSql } from './schema';

export const database = SQLite.openDatabaseSync('dailyline.db');

export const executeSql = async (
  sql: string,
  params: (string | number | null)[] = []
): Promise<{ rows: { length: number; item: (idx: number) => any } }> => {
  const rows = await database.getAllAsync(sql, params);
  return {
    rows: {
      length: rows.length,
      item: (idx: number) => rows[idx],
    },
  };
};

export const runSql = async (
  sql: string,
  params: (string | number | null)[] = []
): Promise<SQLite.SQLiteRunResult> => {
  return await database.runAsync(sql, params);
};

export const initializeDatabase = async (): Promise<void> => {
  await runSql(createTablesSql);
};
