import { createInMemoryEntitlementRepository } from '../InMemoryEntitlementRepository';

describe('InMemoryEntitlementRepository', () => {
  it('returns free entitlement by default', async () => {
    const repository = createInMemoryEntitlementRepository();

    await expect(repository.getEntitlement()).resolves.toEqual({
      status: 'free',
      lastKnownStatus: 'free',
      lastCheckedAt: null
    });
  });

  it('preserves last known premium status when moving to unknown', async () => {
    const repository = createInMemoryEntitlementRepository();

    await repository.setEntitlement('premium', '2026-02-08T10:00:00.000Z');
    const unknown = await repository.setEntitlement('unknown', '2026-02-08T11:00:00.000Z');

    expect(unknown).toEqual({
      status: 'unknown',
      lastKnownStatus: 'premium',
      lastCheckedAt: '2026-02-08T11:00:00.000Z'
    });
  });

  it('replaces state when setEntitlementState is called', async () => {
    const repository = createInMemoryEntitlementRepository();

    await repository.setEntitlementState({
      status: 'unknown',
      lastKnownStatus: 'premium',
      lastCheckedAt: '2026-02-08T12:00:00.000Z'
    });

    await expect(repository.getEntitlement()).resolves.toEqual({
      status: 'unknown',
      lastKnownStatus: 'premium',
      lastCheckedAt: '2026-02-08T12:00:00.000Z'
    });
  });
});
