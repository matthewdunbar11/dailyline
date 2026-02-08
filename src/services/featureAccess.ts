import type { EntitlementStatus } from './iap';
import type { StableEntitlementStatus } from '../domain/entitlement';

export type FeatureKey =
  | 'journal.today.write'
  | 'journal.history.read'
  | 'journal.history.search'
  | 'insights.core'
  | 'insights.ai.sentimentTimeline'
  | 'insights.ai.moodPatterns'
  | 'insights.ai.themeMining'
  | 'insights.ai.streakQuality'
  | 'insights.ai.earlyWarning'
  | 'insights.ai.weeklyReflection'
  | 'insights.ai.comparePeriods'
  | 'settings.restorePurchase'
  | 'ads.display';

export type FeatureAccessState = 'enabled' | 'locked' | 'hidden';

export type FeatureAccessContext = {
  entitlement: EntitlementStatus;
  aiInsightsEnabled: boolean;
  lastKnownEntitlement?: StableEntitlementStatus;
};

const AI_FEATURES: FeatureKey[] = [
  'insights.ai.sentimentTimeline',
  'insights.ai.moodPatterns',
  'insights.ai.themeMining',
  'insights.ai.streakQuality',
  'insights.ai.earlyWarning',
  'insights.ai.weeklyReflection',
  'insights.ai.comparePeriods'
];

const resolvePremiumGateEntitlement = (
  entitlement: EntitlementStatus
): StableEntitlementStatus => {
  return entitlement === 'premium' ? 'premium' : 'free';
};

const resolveAdsEntitlement = (
  context: FeatureAccessContext
): StableEntitlementStatus => {
  if (context.entitlement === 'unknown') {
    return context.lastKnownEntitlement ?? 'free';
  }

  return context.entitlement;
};

const getAiFeatureAccess = (context: FeatureAccessContext): FeatureAccessState => {
  const premiumGateEntitlement = resolvePremiumGateEntitlement(context.entitlement);

  if (premiumGateEntitlement !== 'premium') {
    return 'locked';
  }

  if (!context.aiInsightsEnabled) {
    return 'hidden';
  }

  return 'enabled';
};

export const getFeatureAccess = (
  feature: FeatureKey,
  context: FeatureAccessContext
): FeatureAccessState => {
  if (
    feature === 'journal.today.write' ||
    feature === 'journal.history.read' ||
    feature === 'journal.history.search' ||
    feature === 'insights.core'
  ) {
    return 'enabled';
  }

  if (AI_FEATURES.includes(feature)) {
    return getAiFeatureAccess(context);
  }

  const premiumGateEntitlement = resolvePremiumGateEntitlement(context.entitlement);

  if (feature === 'settings.restorePurchase') {
    return premiumGateEntitlement === 'premium' ? 'enabled' : 'hidden';
  }

  if (feature === 'ads.display') {
    return resolveAdsEntitlement(context) === 'premium' ? 'hidden' : 'enabled';
  }

  return 'hidden';
};

export const isFeatureEnabled = (
  feature: FeatureKey,
  context: FeatureAccessContext
): boolean => {
  return getFeatureAccess(feature, context) === 'enabled';
};
