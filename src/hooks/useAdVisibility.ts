import { useCallback, useEffect, useMemo, useState } from 'react';
import type { EntitlementState } from '../domain/entitlement';
import { DEFAULT_ENTITLEMENT_STATE } from '../domain/entitlement';
import { getEntitlementRepository } from '../repositories';
import { shouldShowAdsForEntitlementState } from '../services/adVisibility';

type UseAdVisibilityReturn = {
  showAds: boolean;
  loading: boolean;
  refreshVisibility: () => Promise<void>;
};

export const useAdVisibility = (): UseAdVisibilityReturn => {
  const [entitlementState, setEntitlementState] = useState<EntitlementState>(
    DEFAULT_ENTITLEMENT_STATE
  );
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const repository = await getEntitlementRepository();
      const state = await repository.getEntitlement();
      setEntitlementState(state);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const showAds = useMemo(
    () => shouldShowAdsForEntitlementState(entitlementState),
    [entitlementState]
  );

  return {
    showAds,
    loading,
    refreshVisibility: load
  };
};
