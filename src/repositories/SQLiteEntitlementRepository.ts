import {
  DEFAULT_ENTITLEMENT_STATE,
  nextEntitlementState,
  type EntitlementState
} from '../domain/entitlement';
import { executeSql, runSql } from '../db/sqlite';
import type { EntitlementStatus } from '../services/iap';
import type { EntitlementRepository } from './EntitlementRepository';

const ENTITLEMENT_KEY = 'entitlement_state';

const isEntitlementStatus = (value: unknown): value is EntitlementStatus => {
  return value === 'free' || value === 'premium' || value === 'unknown';
};

const isStableEntitlementStatus = (
  value: unknown
): value is EntitlementState['lastKnownStatus'] => {
  return value === 'free' || value === 'premium';
};

const normalizeEntitlementState = (stored: Partial<EntitlementState> | null): EntitlementState => {
  const status = isEntitlementStatus(stored?.status)
    ? stored.status
    : DEFAULT_ENTITLEMENT_STATE.status;
  const lastKnownStatus = isStableEntitlementStatus(stored?.lastKnownStatus)
    ? stored.lastKnownStatus
    : DEFAULT_ENTITLEMENT_STATE.lastKnownStatus;
  const lastCheckedAt = typeof stored?.lastCheckedAt === 'string' ? stored.lastCheckedAt : null;

  return {
    status,
    lastKnownStatus,
    lastCheckedAt
  };
};

const parseEntitlementState = (value: string): EntitlementState | null => {
  try {
    const parsed = JSON.parse(value) as Partial<EntitlementState>;
    return normalizeEntitlementState(parsed);
  } catch (error) {
    return null;
  }
};

const saveEntitlementState = async (state: EntitlementState): Promise<void> => {
  await runSql(
    `INSERT INTO settings (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [ENTITLEMENT_KEY, JSON.stringify(state)]
  );
};

const loadStoredEntitlementState = async (): Promise<EntitlementState | null> => {
  const result = await executeSql('SELECT value FROM settings WHERE key = ? LIMIT 1', [
    ENTITLEMENT_KEY
  ]);
  if (result.rows.length === 0) {
    return null;
  }

  return parseEntitlementState(result.rows.item(0).value);
};

export const SQLiteEntitlementRepository: EntitlementRepository = {
  async getEntitlement() {
    const stored = await loadStoredEntitlementState();
    if (stored) {
      return stored;
    }

    await saveEntitlementState(DEFAULT_ENTITLEMENT_STATE);
    return { ...DEFAULT_ENTITLEMENT_STATE };
  },
  async setEntitlement(status: EntitlementStatus, checkedAt?: string) {
    const current = await this.getEntitlement();
    const next = nextEntitlementState(current, status, checkedAt);
    await saveEntitlementState(next);
    return next;
  },
  async setEntitlementState(state: EntitlementState) {
    await saveEntitlementState(normalizeEntitlementState(state));
  }
};
