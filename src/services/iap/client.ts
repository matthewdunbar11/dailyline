import type { StoreOperationResult, StoreProduct } from './types';

export type IapClient = {
  getProducts(productIds: string[]): Promise<StoreProduct[]>;
  purchase(productId: string): Promise<StoreOperationResult>;
  restore(productId: string): Promise<StoreOperationResult>;
};

const unavailableResult: StoreOperationResult = {
  status: 'unavailable',
  entitlementActive: false,
  errorCode: 'STORE_UNAVAILABLE',
  errorMessage: 'In-app purchase client is not configured.'
};

export const createUnavailableIapClient = (): IapClient => {
  return {
    async getProducts() {
      return [];
    },
    async purchase() {
      return unavailableResult;
    },
    async restore() {
      return unavailableResult;
    }
  };
};
