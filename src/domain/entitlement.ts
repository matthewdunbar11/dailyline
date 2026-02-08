import type { EntitlementStatus } from '../services/iap';

export type StableEntitlementStatus = Exclude<EntitlementStatus, 'unknown'>;

export type EntitlementState = {
  status: EntitlementStatus;
  lastKnownStatus: StableEntitlementStatus;
  lastCheckedAt: string | null;
};

export const DEFAULT_ENTITLEMENT_STATE: EntitlementState = {
  status: 'free',
  lastKnownStatus: 'free',
  lastCheckedAt: null
};

export const getEffectiveEntitlementStatus = (
  state: EntitlementState
): StableEntitlementStatus => {
  return state.status === 'unknown' ? state.lastKnownStatus : state.status;
};

export const nextEntitlementState = (
  current: EntitlementState,
  nextStatus: EntitlementStatus,
  checkedAt: string = new Date().toISOString()
): EntitlementState => {
  return {
    status: nextStatus,
    lastKnownStatus: nextStatus === 'unknown' ? current.lastKnownStatus : nextStatus,
    lastCheckedAt: checkedAt
  };
};
