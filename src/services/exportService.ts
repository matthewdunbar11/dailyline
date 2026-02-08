import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getEntryRepository, getSettingsRepository } from '../repositories';
import { buildExportPayload } from './exportPayload';

const getExportDirectory = (): string => {
  const baseDirectory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!baseDirectory) {
    throw new Error('No writable directory is available for export.');
  }
  return baseDirectory;
};

export const exportDataToFile = async (): Promise<{ uri: string; shared: boolean }> => {
  const entryRepository = await getEntryRepository();
  const settingsRepository = await getSettingsRepository();

  const [entries, settings] = await Promise.all([
    entryRepository.listEntries(),
    settingsRepository.getSettings()
  ]);

  const payload = buildExportPayload(entries, settings);
  const directory = getExportDirectory();
  const fileUri = `${directory}dailyline-export-${Date.now()}.json`;

  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2));

  let shared = false;
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri);
    shared = true;
  }

  return { uri: fileUri, shared };
};
