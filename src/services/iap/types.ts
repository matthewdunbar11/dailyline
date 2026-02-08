export type RuntimePlatform = 'ios' | 'android';

export type EntitlementStatus = 'free' | 'premium' | 'unknown';

export type IapProductType = 'non_consumable';

export type StoreProduct = {
  productId: string;
  title: string;
  description: string;
  price: string;
};

export type PremiumProductDetails = {
  productId: string;
  platform: RuntimePlatform;
  type: IapProductType;
  available: boolean;
  title?: string;
  description?: string;
  price?: string;
};

export type StoreOperationStatus =
  | 'success'
  | 'cancelled'
  | 'pending'
  | 'failed'
  | 'unavailable';

export type StoreOperationResult = {
  status: StoreOperationStatus;
  entitlementActive: boolean;
  transactionId?: string;
  errorCode?: string;
  errorMessage?: string;
};

export type PremiumOperationResult = {
  status: StoreOperationStatus;
  entitlement: EntitlementStatus;
  productId: string;
  transactionId?: string;
  errorCode?: string;
  errorMessage?: string;
};
