import { addDays, formatDateKey, parseDateKey } from '../date';

describe('date helpers', () => {
  it('formats date keys as YYYY-MM-DD', () => {
    const date = new Date('2024-03-05T10:00:00Z');
    expect(formatDateKey(date, 'UTC')).toBe('2024-03-05');
  });

  it('parses date keys back into Date objects', () => {
    const parsed = parseDateKey('2024-03-05');
    expect(parsed.getFullYear()).toBe(2024);
    expect(parsed.getMonth()).toBe(2);
    expect(parsed.getDate()).toBe(5);
  });

  it('adds days to a date key', () => {
    expect(addDays('2024-03-05', 1)).toBe('2024-03-06');
  });
});
