import { SCHEMA_VERSION } from '../db/schema';
import type { Entry } from '../types/entry';
import type { UserSettings } from '../types/settings';

export type ExportPayload = {
  schemaVersion: number;
  exportedAt: string;
  entries: Entry[];
  settings: UserSettings;
};

export const buildExportPayload = (entries: Entry[], settings: UserSettings): ExportPayload => {
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    entries,
    settings
  };
};
