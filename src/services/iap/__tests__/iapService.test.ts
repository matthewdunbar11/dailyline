import { createIapService } from '../iapService';
import type { IapClient } from '../client';

const createClientMock = (): jest.Mocked<IapClient> => {
  return {
    getProducts: jest.fn(),
    purchase: jest.fn(),
    restore: jest.fn()
  };
};

describe('iap service', () => {
  it('returns premium product details when the store product exists', async () => {
    const client = createClientMock();
    client.getProducts.mockResolvedValue([
      {
        productId: 'dailyline.premium.lifetime',
        title: 'Premium Lifetime',
        description: 'Unlock premium forever',
        price: '$9.99'
      }
    ]);

    const service = createIapService(client);
    const result = await service.getPremiumProduct('ios');

    expect(client.getProducts).toHaveBeenCalledWith(['dailyline.premium.lifetime']);
    expect(result).toEqual({
      productId: 'dailyline.premium.lifetime',
      platform: 'ios',
      type: 'non_consumable',
      available: true,
      title: 'Premium Lifetime',
      description: 'Unlock premium forever',
      price: '$9.99'
    });
  });

  it('returns unavailable product details when product metadata is missing', async () => {
    const client = createClientMock();
    client.getProducts.mockResolvedValue([]);

    const service = createIapService(client);
    const result = await service.getPremiumProduct('android');

    expect(result).toEqual({
      productId: 'dailyline.premium.lifetime',
      platform: 'android',
      type: 'non_consumable',
      available: false
    });
  });

  it('maps purchase result to premium entitlement state', async () => {
    const client = createClientMock();
    client.purchase.mockResolvedValue({
      status: 'success',
      entitlementActive: true,
      transactionId: 'txn-123'
    });

    const service = createIapService(client);
    const result = await service.purchasePremium('ios');

    expect(client.purchase).toHaveBeenCalledWith('dailyline.premium.lifetime');
    expect(result).toEqual({
      status: 'success',
      entitlement: 'premium',
      productId: 'dailyline.premium.lifetime',
      transactionId: 'txn-123',
      errorCode: undefined,
      errorMessage: undefined
    });
  });

  it('maps unavailable restore result to unknown entitlement', async () => {
    const client = createClientMock();
    client.restore.mockResolvedValue({
      status: 'unavailable',
      entitlementActive: false,
      errorCode: 'STORE_UNAVAILABLE',
      errorMessage: 'Store unavailable'
    });

    const service = createIapService(client);
    const result = await service.restorePremium('android');

    expect(client.restore).toHaveBeenCalledWith('dailyline.premium.lifetime');
    expect(result).toEqual({
      status: 'unavailable',
      entitlement: 'unknown',
      productId: 'dailyline.premium.lifetime',
      transactionId: undefined,
      errorCode: 'STORE_UNAVAILABLE',
      errorMessage: 'Store unavailable'
    });
  });
});
