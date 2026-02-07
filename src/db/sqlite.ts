import * as SQLite from 'expo-sqlite';
import { createTablesSql } from './schema';

const database = SQLite.openDatabase('dailyline.db');

const executeSql = (sql: string, params: (string | number | null)[] = []): Promise<SQLite.SQLResultSet> => {
  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        sql,
        params,
        (_, result) => resolve(result),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const initializeDatabase = async (): Promise<void> => {
  await executeSql(createTablesSql);
};

export { database, executeSql };
