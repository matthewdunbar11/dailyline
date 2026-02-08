import { SCHEMA_VERSION } from '../../db/schema';
import { buildExportPayload } from '../exportPayload';

describe('buildExportPayload', () => {
  it('includes schema version, entries, and settings', () => {
    const entries = [
      {
        id: 'entry-1',
        date: '2025-01-01',
        text: 'Hello',
        mood: 'happy',
        tags: ['gratitude'],
        createdAt: '2025-01-01T12:00:00.000Z',
        updatedAt: '2025-01-01T12:00:00.000Z'
      }
    ];
    const settings = {
      timezone: 'UTC',
      reminderEnabled: true,
      reminderHour: 8,
      reminderMinute: 15,
      theme: 'system' as const,
      premiumStatus: 'free' as const,
      aiInsightsEnabled: false
    };

    const payload = buildExportPayload(entries, settings);

    expect(payload.schemaVersion).toBe(SCHEMA_VERSION);
    expect(payload.entries).toEqual(entries);
    expect(payload.settings).toEqual(settings);
    expect(new Date(payload.exportedAt).toISOString()).toBe(payload.exportedAt);
  });
});
