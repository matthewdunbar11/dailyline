import {
  DEFAULT_ENTITLEMENT_STATE,
  nextEntitlementState,
  type EntitlementState
} from '../domain/entitlement';
import type { EntitlementStatus } from '../services/iap';
import type { EntitlementRepository } from './EntitlementRepository';

export const createInMemoryEntitlementRepository = (
  seed: EntitlementState = DEFAULT_ENTITLEMENT_STATE
): EntitlementRepository => {
  let state = { ...seed };

  return {
    async getEntitlement() {
      return { ...state };
    },
    async setEntitlement(status: EntitlementStatus, checkedAt?: string) {
      state = nextEntitlementState(state, status, checkedAt);
      return { ...state };
    },
    async setEntitlementState(nextState: EntitlementState) {
      state = { ...nextState };
    }
  };
};
