import { createInMemoryEntryRepository } from './InMemoryEntryRepository';
import { createInMemorySettingsRepository } from './InMemorySettingsRepository';
import { createInMemoryEntitlementRepository } from './InMemoryEntitlementRepository';

const entryRepository = createInMemoryEntryRepository();
const settingsRepository = createInMemorySettingsRepository();
const entitlementRepository = createInMemoryEntitlementRepository();

export const getEntryRepository = async () => {
  return entryRepository;
};

export const getSettingsRepository = async () => {
  return settingsRepository;
};

export const getEntitlementRepository = async () => {
  return entitlementRepository;
};
