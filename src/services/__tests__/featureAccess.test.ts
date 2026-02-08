import { getFeatureAccess, isFeatureEnabled } from '../featureAccess';

describe('FeatureAccessService', () => {
  it('keeps core journaling features enabled for free users', () => {
    const context = {
      entitlement: 'free' as const,
      aiInsightsEnabled: false
    };

    expect(getFeatureAccess('journal.today.write', context)).toBe('enabled');
    expect(getFeatureAccess('journal.history.read', context)).toBe('enabled');
    expect(getFeatureAccess('journal.history.search', context)).toBe('enabled');
    expect(getFeatureAccess('insights.core', context)).toBe('enabled');
  });

  it('locks premium AI features for free users', () => {
    const context = {
      entitlement: 'free' as const,
      aiInsightsEnabled: true
    };

    expect(getFeatureAccess('insights.ai.sentimentTimeline', context)).toBe('locked');
    expect(getFeatureAccess('settings.restorePurchase', context)).toBe('hidden');
    expect(getFeatureAccess('ads.display', context)).toBe('enabled');
  });

  it('enables premium features and hides ads for premium users', () => {
    const context = {
      entitlement: 'premium' as const,
      aiInsightsEnabled: true
    };

    expect(getFeatureAccess('insights.ai.themeMining', context)).toBe('enabled');
    expect(getFeatureAccess('settings.restorePurchase', context)).toBe('enabled');
    expect(getFeatureAccess('ads.display', context)).toBe('hidden');
    expect(isFeatureEnabled('insights.ai.weeklyReflection', context)).toBe(true);
  });

  it('hides AI cards for premium users when AI insights are disabled', () => {
    const context = {
      entitlement: 'premium' as const,
      aiInsightsEnabled: false
    };

    expect(getFeatureAccess('insights.ai.comparePeriods', context)).toBe('hidden');
    expect(getFeatureAccess('insights.core', context)).toBe('enabled');
  });

  it('treats unknown entitlement as free for premium gates', () => {
    const context = {
      entitlement: 'unknown' as const,
      aiInsightsEnabled: true,
      lastKnownEntitlement: 'premium' as const
    };

    expect(getFeatureAccess('insights.ai.earlyWarning', context)).toBe('locked');
    expect(getFeatureAccess('settings.restorePurchase', context)).toBe('hidden');
  });

  it('uses last known entitlement for ad visibility when status is unknown', () => {
    const context = {
      entitlement: 'unknown' as const,
      aiInsightsEnabled: true,
      lastKnownEntitlement: 'premium' as const
    };

    expect(getFeatureAccess('ads.display', context)).toBe('hidden');

    const fallbackContext = {
      entitlement: 'unknown' as const,
      aiInsightsEnabled: true
    };

    expect(getFeatureAccess('ads.display', fallbackContext)).toBe('enabled');
  });
});
