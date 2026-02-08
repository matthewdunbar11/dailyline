import {
  DEFAULT_ENTITLEMENT_STATE,
  getEffectiveEntitlementStatus,
  nextEntitlementState
} from '../entitlement';

describe('entitlement state helpers', () => {
  it('defaults to free entitlement', () => {
    expect(DEFAULT_ENTITLEMENT_STATE).toEqual({
      status: 'free',
      lastKnownStatus: 'free',
      lastCheckedAt: null
    });
    expect(getEffectiveEntitlementStatus(DEFAULT_ENTITLEMENT_STATE)).toBe('free');
  });

  it('uses last known status when current status is unknown', () => {
    const unknownPremium = {
      status: 'unknown' as const,
      lastKnownStatus: 'premium' as const,
      lastCheckedAt: '2026-02-08T00:00:00.000Z'
    };

    expect(getEffectiveEntitlementStatus(unknownPremium)).toBe('premium');
  });

  it('preserves last known status when transitioning to unknown', () => {
    const current = {
      status: 'premium' as const,
      lastKnownStatus: 'premium' as const,
      lastCheckedAt: '2026-02-08T00:00:00.000Z'
    };

    const next = nextEntitlementState(current, 'unknown', '2026-02-08T01:00:00.000Z');

    expect(next).toEqual({
      status: 'unknown',
      lastKnownStatus: 'premium',
      lastCheckedAt: '2026-02-08T01:00:00.000Z'
    });
  });

  it('updates last known status when transitioning to premium or free', () => {
    const current = {
      status: 'unknown' as const,
      lastKnownStatus: 'free' as const,
      lastCheckedAt: '2026-02-08T00:00:00.000Z'
    };

    const premium = nextEntitlementState(current, 'premium', '2026-02-08T01:00:00.000Z');
    expect(premium.lastKnownStatus).toBe('premium');

    const free = nextEntitlementState(premium, 'free', '2026-02-08T02:00:00.000Z');
    expect(free.lastKnownStatus).toBe('free');
  });
});
