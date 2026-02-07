import { calculateStreaks } from '../streak';
import type { Entry } from '../../types/entry';

const entry = (date: string): Entry => ({
  id: `entry-${date}`,
  date,
  text: 'sample',
  createdAt: `${date}T09:00:00Z`,
  updatedAt: `${date}T09:00:00Z`
});

describe('streak calculation', () => {
  it('calculates current and longest streak', () => {
    const entries = [
      entry('2024-03-01'),
      entry('2024-03-02'),
      entry('2024-03-04'),
      entry('2024-03-05')
    ];

    const result = calculateStreaks(entries, '2024-03-05');
    expect(result.current).toBe(2);
    expect(result.longest).toBe(2);
  });

  it('returns zero current streak when today has no entry', () => {
    const entries = [entry('2024-03-01')];
    const result = calculateStreaks(entries, '2024-03-02');
    expect(result.current).toBe(0);
    expect(result.longest).toBe(1);
  });
});
