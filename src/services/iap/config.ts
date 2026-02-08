import type { IapProductType, RuntimePlatform } from './types';

export const PREMIUM_PRODUCT_TYPE: IapProductType = 'non_consumable';

export const PREMIUM_PRODUCT_IDS: Record<RuntimePlatform, string> = {
  ios: 'dailyline.premium.lifetime',
  android: 'dailyline.premium.lifetime'
};

export const getPremiumProductId = (platform: RuntimePlatform): string => {
  return PREMIUM_PRODUCT_IDS[platform];
};
