import type { EntitlementState } from '../domain/entitlement';
import { getFeatureAccess } from './featureAccess';

export const shouldShowAdsForEntitlementState = (
  entitlementState: EntitlementState
): boolean => {
  return (
    getFeatureAccess('ads.display', {
      entitlement: entitlementState.status,
      aiInsightsEnabled: true,
      lastKnownEntitlement: entitlementState.lastKnownStatus
    }) === 'enabled'
  );
};
