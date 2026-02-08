import { createIapService } from '../../services/iap';

describe('iap service fallback behavior', () => {
  it('returns unavailable operation by default when no client is configured', async () => {
    const service = createIapService();

    const purchase = await service.purchasePremium('ios');
    expect(purchase.status).toBe('unavailable');
    expect(purchase.entitlement).toBe('unknown');

    const restore = await service.restorePremium('android');
    expect(restore.status).toBe('unavailable');
    expect(restore.entitlement).toBe('unknown');
  });
});
