import {
  getPremiumProductId,
  PREMIUM_PRODUCT_IDS,
  PREMIUM_PRODUCT_TYPE
} from '../config';

describe('iap config', () => {
  it('uses non-consumable premium product type', () => {
    expect(PREMIUM_PRODUCT_TYPE).toBe('non_consumable');
  });

  it('resolves platform product IDs', () => {
    expect(getPremiumProductId('ios')).toBe(PREMIUM_PRODUCT_IDS.ios);
    expect(getPremiumProductId('android')).toBe(PREMIUM_PRODUCT_IDS.android);
  });
});
