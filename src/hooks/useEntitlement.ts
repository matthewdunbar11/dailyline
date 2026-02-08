import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import {
  getEffectiveEntitlementStatus,
  type EntitlementState
} from '../domain/entitlement';
import { getEntitlementRepository } from '../repositories';
import {
  createIapService,
  type PremiumOperationResult,
  type PremiumProductDetails,
  type RuntimePlatform
} from '../services/iap';

type EntitlementAction = 'purchase' | 'restore' | null;

type UseEntitlementReturn = {
  entitlementState: EntitlementState | null;
  effectiveEntitlement: 'free' | 'premium';
  premiumProduct: PremiumProductDetails | null;
  loading: boolean;
  actionInFlight: EntitlementAction;
  statusMessage: string | null;
  refreshEntitlement: () => Promise<void>;
  purchasePremium: () => Promise<PremiumOperationResult | null>;
  restorePremium: () => Promise<PremiumOperationResult | null>;
};

const resolveRuntimePlatform = (): RuntimePlatform | null => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return Platform.OS;
  }
  return null;
};

const createUnavailableResult = (reason: string): PremiumOperationResult => {
  return {
    status: 'unavailable',
    entitlement: 'unknown',
    productId: 'dailyline.premium.lifetime',
    errorCode: 'STORE_UNAVAILABLE',
    errorMessage: reason
  };
};

const toStatusMessage = (result: PremiumOperationResult): string => {
  if (result.status === 'success') {
    return result.entitlement === 'premium'
      ? 'Premium unlocked successfully.'
      : 'Purchase completed, but premium entitlement is still pending.';
  }

  if (result.status === 'cancelled') {
    return 'Purchase cancelled.';
  }

  if (result.status === 'pending') {
    return 'Purchase is pending confirmation.';
  }

  if (result.status === 'unavailable') {
    return result.errorMessage ?? 'Purchases are unavailable on this device right now.';
  }

  return result.errorMessage ?? 'Purchase check failed. Please try again.';
};

export const useEntitlement = (): UseEntitlementReturn => {
  const iapService = useMemo(() => createIapService(), []);
  const [entitlementState, setEntitlementState] = useState<EntitlementState | null>(null);
  const [premiumProduct, setPremiumProduct] = useState<PremiumProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionInFlight, setActionInFlight] = useState<EntitlementAction>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadEntitlement = useCallback(async () => {
    setLoading(true);
    try {
      const repository = await getEntitlementRepository();
      const current = await repository.getEntitlement();
      setEntitlementState(current);

      const platform = resolveRuntimePlatform();
      if (!platform) {
        setPremiumProduct({
          productId: 'dailyline.premium.lifetime',
          platform: 'ios',
          type: 'non_consumable',
          available: false
        });
      } else {
        const product = await iapService.getPremiumProduct(platform);
        setPremiumProduct(product);
      }
    } finally {
      setLoading(false);
    }
  }, [iapService]);

  useEffect(() => {
    loadEntitlement();
  }, [loadEntitlement]);

  const runAction = useCallback(
    async (action: 'purchase' | 'restore'): Promise<PremiumOperationResult> => {
      const platform = resolveRuntimePlatform();
      if (!platform) {
        return createUnavailableResult('Purchases are available only on iOS and Android.');
      }

      if (action === 'purchase') {
        return iapService.purchasePremium(platform);
      }

      return iapService.restorePremium(platform);
    },
    [iapService]
  );

  const applyResult = useCallback(async (result: PremiumOperationResult) => {
    const repository = await getEntitlementRepository();
    const next = await repository.setEntitlement(result.entitlement);
    setEntitlementState(next);
    setStatusMessage(toStatusMessage(result));
  }, []);

  const purchasePremium = useCallback(async (): Promise<PremiumOperationResult | null> => {
    try {
      setActionInFlight('purchase');
      const result = await runAction('purchase');
      await applyResult(result);
      return result;
    } catch (error) {
      setStatusMessage('Purchase failed. Please try again.');
      return null;
    } finally {
      setActionInFlight(null);
    }
  }, [runAction, applyResult]);

  const restorePremium = useCallback(async (): Promise<PremiumOperationResult | null> => {
    try {
      setActionInFlight('restore');
      const result = await runAction('restore');
      await applyResult(result);
      return result;
    } catch (error) {
      setStatusMessage('Restore failed. Please try again.');
      return null;
    } finally {
      setActionInFlight(null);
    }
  }, [runAction, applyResult]);

  return {
    entitlementState,
    effectiveEntitlement: entitlementState
      ? getEffectiveEntitlementStatus(entitlementState)
      : 'free',
    premiumProduct,
    loading,
    actionInFlight,
    statusMessage,
    refreshEntitlement: loadEntitlement,
    purchasePremium,
    restorePremium
  };
};
