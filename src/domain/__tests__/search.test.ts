import { filterEntries } from '../search';
import type { Entry } from '../../types/entry';

const entry = (date: string, text: string): Entry => ({
  id: `entry-${date}`,
  date,
  text,
  createdAt: `${date}T09:00:00Z`,
  updatedAt: `${date}T09:00:00Z`
});

describe('search filter', () => {
  it('filters by query and date', () => {
    const entries = [
      entry('2024-03-01', 'Morning run'),
      entry('2024-03-02', 'Quiet reading')
    ];

    expect(filterEntries(entries, 'run')).toHaveLength(1);
    expect(filterEntries(entries, '', '2024-03-02')).toHaveLength(1);
    expect(filterEntries(entries, 'run', '2024-03-02')).toHaveLength(0);
  });
});
