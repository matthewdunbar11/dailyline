import { isEntryEditable } from '../entryRules';

describe('entry rules', () => {
  it('allows edits for today only', () => {
    expect(isEntryEditable('2024-03-10', '2024-03-10')).toBe(true);
    expect(isEntryEditable('2024-03-09', '2024-03-10')).toBe(false);
  });
});
