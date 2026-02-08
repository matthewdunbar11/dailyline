import type { EntitlementStatus } from '../services/iap';
import type { EntitlementState } from '../domain/entitlement';

export type EntitlementRepository = {
  getEntitlement(): Promise<EntitlementState>;
  setEntitlement(status: EntitlementStatus, checkedAt?: string): Promise<EntitlementState>;
  setEntitlementState(state: EntitlementState): Promise<void>;
};
