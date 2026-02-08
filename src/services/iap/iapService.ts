import { getPremiumProductId, PREMIUM_PRODUCT_TYPE } from './config';
import { createUnavailableIapClient, type IapClient } from './client';
import type {
  EntitlementStatus,
  PremiumOperationResult,
  PremiumProductDetails,
  RuntimePlatform,
  StoreOperationResult
} from './types';

const resolveEntitlement = (result: StoreOperationResult): EntitlementStatus => {
  if (result.status === 'unavailable' || result.status === 'pending') {
    return 'unknown';
  }

  if (result.status === 'failed') {
    return result.entitlementActive ? 'premium' : 'unknown';
  }

  return result.entitlementActive ? 'premium' : 'free';
};

const toOperationResult = (
  productId: string,
  result: StoreOperationResult
): PremiumOperationResult => {
  return {
    status: result.status,
    entitlement: resolveEntitlement(result),
    productId,
    transactionId: result.transactionId,
    errorCode: result.errorCode,
    errorMessage: result.errorMessage
  };
};

export type IapService = {
  getPremiumProduct(platform: RuntimePlatform): Promise<PremiumProductDetails>;
  purchasePremium(platform: RuntimePlatform): Promise<PremiumOperationResult>;
  restorePremium(platform: RuntimePlatform): Promise<PremiumOperationResult>;
};

export const createIapService = (
  client: IapClient = createUnavailableIapClient()
): IapService => {
  const getPremiumProduct = async (platform: RuntimePlatform): Promise<PremiumProductDetails> => {
    const productId = getPremiumProductId(platform);
    const products = await client.getProducts([productId]);
    const product = products.find((item) => item.productId === productId);

    if (!product) {
      return {
        productId,
        platform,
        type: PREMIUM_PRODUCT_TYPE,
        available: false
      };
    }

    return {
      productId,
      platform,
      type: PREMIUM_PRODUCT_TYPE,
      available: true,
      title: product.title,
      description: product.description,
      price: product.price
    };
  };

  const purchasePremium = async (platform: RuntimePlatform): Promise<PremiumOperationResult> => {
    const productId = getPremiumProductId(platform);
    const result = await client.purchase(productId);
    return toOperationResult(productId, result);
  };

  const restorePremium = async (platform: RuntimePlatform): Promise<PremiumOperationResult> => {
    const productId = getPremiumProductId(platform);
    const result = await client.restore(productId);
    return toOperationResult(productId, result);
  };

  return {
    getPremiumProduct,
    purchasePremium,
    restorePremium
  };
};
