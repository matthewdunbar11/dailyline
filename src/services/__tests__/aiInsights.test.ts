import { buildAIInsightsReport, scoreEntrySentiment } from '../aiInsights';
import type { Entry } from '../../types/entry';

type EntrySeed = {
  date: string;
  text: string;
  mood?: string | null;
  tags?: string[];
  createdAt?: string;
};

const createEntries = (seeds: EntrySeed[]): Entry[] => {
  return seeds.map((seed, index) => ({
    id: `entry-${index + 1}`,
    date: seed.date,
    text: seed.text,
    mood: seed.mood ?? null,
    tags: seed.tags ?? [],
    createdAt: seed.createdAt ?? `${seed.date}T08:00:00.000Z`,
    updatedAt: seed.createdAt ?? `${seed.date}T08:00:00.000Z`
  }));
};

describe('aiInsights', () => {
  it('scores positive and negative entries deterministically', () => {
    const positive = scoreEntrySentiment({
      id: '1',
      date: '2026-02-01',
      text: 'great calm productive win',
      mood: 'happy',
      tags: [],
      createdAt: '2026-02-01T08:00:00.000Z',
      updatedAt: '2026-02-01T08:00:00.000Z'
    });

    const negative = scoreEntrySentiment({
      id: '2',
      date: '2026-02-02',
      text: 'stressed tired hard day',
      mood: 'sad',
      tags: [],
      createdAt: '2026-02-02T21:00:00.000Z',
      updatedAt: '2026-02-02T21:00:00.000Z'
    });

    expect(positive).toBeGreaterThan(0);
    expect(negative).toBeLessThan(0);
  });

  it('marks AI cards as insufficient with sparse data', () => {
    const entries = createEntries([
      {
        date: '2026-02-01',
        text: 'quiet day',
        mood: 'calm',
        tags: ['home']
      },
      {
        date: '2026-02-03',
        text: 'busy but okay',
        mood: 'focused',
        tags: ['work']
      }
    ]);

    const report = buildAIInsightsReport(entries, '2026-02-08');

    expect(report.sentimentTimeline.status).toBe('insufficient');
    expect(report.themeMining.status).toBe('insufficient');
    expect(report.weeklyReflection.status).toBe('insufficient');
    expect(report.comparePeriods.status).toBe('insufficient');
  });

  it('computes month-over-month sentiment and theme deltas', () => {
    const entries = createEntries([
      {
        date: '2026-01-08',
        text: 'stressed hard deadline issue',
        mood: 'stressed',
        tags: ['work', 'deadline'],
        createdAt: '2026-01-08T20:00:00.000Z'
      },
      {
        date: '2026-01-14',
        text: 'tired and frustrated from work pressure',
        mood: 'tired',
        tags: ['work', 'deadline'],
        createdAt: '2026-01-14T21:00:00.000Z'
      },
      {
        date: '2026-01-20',
        text: 'sad day with hard blocker',
        mood: 'sad',
        tags: ['work', 'project'],
        createdAt: '2026-01-20T19:00:00.000Z'
      },
      {
        date: '2026-02-02',
        text: 'great calm run and clear focus',
        mood: 'calm',
        tags: ['exercise', 'focus'],
        createdAt: '2026-02-02T07:30:00.000Z'
      },
      {
        date: '2026-02-06',
        text: 'good productive workout',
        mood: 'energized',
        tags: ['exercise', 'health'],
        createdAt: '2026-02-06T08:15:00.000Z'
      },
      {
        date: '2026-02-10',
        text: 'happy clear day with family',
        mood: 'happy',
        tags: ['exercise', 'family'],
        createdAt: '2026-02-10T09:00:00.000Z'
      },
      {
        date: '2026-02-15',
        text: 'relaxed dinner and strong recovery',
        mood: 'calm',
        tags: ['family', 'exercise'],
        createdAt: '2026-02-15T18:20:00.000Z'
      },
      {
        date: '2026-02-18',
        text: 'great steady morning and grateful finish',
        mood: 'good',
        tags: ['exercise', 'focus'],
        createdAt: '2026-02-18T07:10:00.000Z'
      }
    ]);

    const report = buildAIInsightsReport(entries, '2026-02-20');

    expect(report.sentimentTimeline.status).toBe('ready');
    expect(report.sentimentTimeline.direction).toBe('up');
    expect(report.comparePeriods.status).toBe('ready');
    expect(report.comparePeriods.direction).toBe('up');
    expect(report.comparePeriods.sentimentDelta).toBeGreaterThan(0);
    expect(report.comparePeriods.topCurrentTheme).toBe('exercise');
    expect(report.themeMining.status).toBe('ready');
    expect(report.themeMining.topThemes).toContain('exercise');
  });

  it('flags early warning when sustained negative trend appears', () => {
    const entries = createEntries([
      {
        date: '2026-02-01',
        text: 'okay start',
        mood: 'focused',
        tags: ['routine']
      },
      {
        date: '2026-02-02',
        text: 'hard day and stressed',
        mood: 'stressed',
        tags: ['work']
      },
      {
        date: '2026-02-03',
        text: 'tired and sad',
        mood: 'sad',
        tags: ['work']
      },
      {
        date: '2026-02-04',
        text: 'frustrated and overwhelmed',
        mood: 'anxious',
        tags: ['work']
      },
      {
        date: '2026-02-05',
        text: 'stressed drained low',
        mood: 'stressed',
        tags: ['work']
      },
      {
        date: '2026-02-06',
        text: 'sad upset tired',
        mood: 'sad',
        tags: ['work']
      },
      {
        date: '2026-02-07',
        text: 'hard anxious day',
        mood: 'anxious',
        tags: ['work']
      }
    ]);

    const report = buildAIInsightsReport(entries, '2026-02-08');

    expect(report.earlyWarning.status).toBe('ready');
    expect(report.earlyWarning.level).toBe('watch');
  });
});
