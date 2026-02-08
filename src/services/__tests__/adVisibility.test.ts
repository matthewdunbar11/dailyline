import { shouldShowAdsForEntitlementState } from '../adVisibility';

describe('shouldShowAdsForEntitlementState', () => {
  it('shows ads for free users', () => {
    expect(
      shouldShowAdsForEntitlementState({
        status: 'free',
        lastKnownStatus: 'free',
        lastCheckedAt: '2026-02-08T10:00:00.000Z'
      })
    ).toBe(true);
  });

  it('hides ads for premium users', () => {
    expect(
      shouldShowAdsForEntitlementState({
        status: 'premium',
        lastKnownStatus: 'premium',
        lastCheckedAt: '2026-02-08T10:00:00.000Z'
      })
    ).toBe(false);
  });

  it('uses last known entitlement when status is unknown', () => {
    expect(
      shouldShowAdsForEntitlementState({
        status: 'unknown',
        lastKnownStatus: 'premium',
        lastCheckedAt: '2026-02-08T10:00:00.000Z'
      })
    ).toBe(false);

    expect(
      shouldShowAdsForEntitlementState({
        status: 'unknown',
        lastKnownStatus: 'free',
        lastCheckedAt: '2026-02-08T10:00:00.000Z'
      })
    ).toBe(true);
  });
});
