import { createInMemoryEntitlementRepository } from '../../repositories/InMemoryEntitlementRepository';
import { getFeatureAccess } from '../featureAccess';
import { createIapService, type IapClient } from '../iap';

const createClientMock = (): jest.Mocked<IapClient> => {
  return {
    getProducts: jest.fn(),
    purchase: jest.fn(),
    restore: jest.fn()
  };
};

describe('entitlement transitions and feature gates', () => {
  it('unlocks premium gates and hides ads after successful purchase', async () => {
    const client = createClientMock();
    client.purchase.mockResolvedValue({
      status: 'success',
      entitlementActive: true,
      transactionId: 'txn-001'
    });

    const service = createIapService(client);
    const repository = createInMemoryEntitlementRepository();

    const result = await service.purchasePremium('ios');
    const state = await repository.setEntitlement(result.entitlement, '2026-02-08T12:00:00.000Z');

    expect(getFeatureAccess('insights.ai.sentimentTimeline', {
      entitlement: state.status,
      aiInsightsEnabled: true,
      lastKnownEntitlement: state.lastKnownStatus
    })).toBe('enabled');

    expect(getFeatureAccess('ads.display', {
      entitlement: state.status,
      aiInsightsEnabled: true,
      lastKnownEntitlement: state.lastKnownStatus
    })).toBe('hidden');
  });

  it('uses cached premium for ads but free-lock policy for premium gates during unknown status', async () => {
    const client = createClientMock();
    client.purchase.mockResolvedValue({
      status: 'success',
      entitlementActive: true
    });
    client.restore.mockResolvedValue({
      status: 'unavailable',
      entitlementActive: false,
      errorCode: 'STORE_UNAVAILABLE',
      errorMessage: 'Store temporarily unavailable'
    });

    const service = createIapService(client);
    const repository = createInMemoryEntitlementRepository();

    const purchased = await service.purchasePremium('ios');
    await repository.setEntitlement(purchased.entitlement, '2026-02-08T12:00:00.000Z');

    const restoreResult = await service.restorePremium('ios');
    const state = await repository.setEntitlement(restoreResult.entitlement, '2026-02-08T12:10:00.000Z');

    expect(state).toEqual({
      status: 'unknown',
      lastKnownStatus: 'premium',
      lastCheckedAt: '2026-02-08T12:10:00.000Z'
    });

    expect(getFeatureAccess('insights.ai.weeklyReflection', {
      entitlement: state.status,
      aiInsightsEnabled: true,
      lastKnownEntitlement: state.lastKnownStatus
    })).toBe('locked');

    expect(getFeatureAccess('ads.display', {
      entitlement: state.status,
      aiInsightsEnabled: true,
      lastKnownEntitlement: state.lastKnownStatus
    })).toBe('hidden');
  });
});
