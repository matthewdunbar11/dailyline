import { addDays, parseDateKey } from '../domain/date';
import type { Entry } from '../types/entry';

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_SENTIMENT_ENTRIES = 5;
const MIN_PATTERN_ENTRIES = 6;
const MIN_THEME_ENTRIES = 8;
const MIN_WARNING_ENTRIES = 6;
const MIN_WEEKLY_REFLECTION_ENTRIES = 3;
const MIN_COMPARE_PERIOD_ENTRIES = 3;

const POSITIVE_WORDS = new Set([
  'calm',
  'clear',
  'focused',
  'good',
  'great',
  'grateful',
  'happy',
  'joy',
  'productive',
  'relaxed',
  'steady',
  'strong',
  'win'
]);

const NEGATIVE_WORDS = new Set([
  'angry',
  'anxious',
  'drained',
  'frustrated',
  'hard',
  'low',
  'overwhelmed',
  'sad',
  'stressed',
  'stressful',
  'tired',
  'upset',
  'worry'
]);

const POSITIVE_MOODS = new Set(['calm', 'content', 'energized', 'good', 'great', 'happy']);
const NEGATIVE_MOODS = new Set(['angry', 'anxious', 'low', 'sad', 'stressed', 'tired']);

const STOP_WORDS = new Set([
  'about',
  'after',
  'again',
  'almost',
  'also',
  'and',
  'another',
  'because',
  'been',
  'before',
  'being',
  'between',
  'from',
  'have',
  'into',
  'just',
  'like',
  'many',
  'more',
  'most',
  'over',
  'really',
  'some',
  'that',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'this',
  'today',
  'very',
  'with',
  'work'
]);

export type InsightStatus = 'ready' | 'insufficient';
export type TrendDirection = 'up' | 'down' | 'no-change';
export type EarlyWarningLevel = 'stable' | 'watch';

export type SentimentTimelinePoint = {
  label: string;
  average: number | null;
  entries: number;
};

export type SentimentTimelineInsight = {
  status: InsightStatus;
  summary: string;
  weeklyPoints: SentimentTimelinePoint[];
  direction: TrendDirection;
  monthlyDelta: number;
  currentMonthAverage: number | null;
  previousMonthAverage: number | null;
};

export type MoodPatternInsight = {
  status: InsightStatus;
  summary: string;
  dayPattern: string;
  timePattern: string;
  topMood: string | null;
};

export type ThemeMiningInsight = {
  status: InsightStatus;
  summary: string;
  topThemes: string[];
  positiveTheme: string | null;
  challengingTheme: string | null;
};

export type StreakQualityInsight = {
  status: InsightStatus;
  summary: string;
  consistencyScore: number;
  entriesInLast30Days: number;
  longestGapDays: number;
};

export type EarlyWarningInsight = {
  status: InsightStatus;
  summary: string;
  level: EarlyWarningLevel;
  recentAverage: number | null;
  previousAverage: number | null;
  prompt: string;
};

export type WeeklyReflectionInsight = {
  status: InsightStatus;
  summary: string;
  wins: string[];
  stressors: string[];
  prompt: string;
};

export type ComparePeriodsInsight = {
  status: InsightStatus;
  summary: string;
  direction: TrendDirection;
  sentimentDelta: number;
  topCurrentTheme: string | null;
  topPreviousTheme: string | null;
};

export type AIInsightsReport = {
  sentimentTimeline: SentimentTimelineInsight;
  moodPatterns: MoodPatternInsight;
  themeMining: ThemeMiningInsight;
  streakQuality: StreakQualityInsight;
  earlyWarning: EarlyWarningInsight;
  weeklyReflection: WeeklyReflectionInsight;
  comparePeriods: ComparePeriodsInsight;
};

const round = (value: number, digits: number): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

const average = (values: number[]): number | null => {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const tokenize = (text: string): string[] => {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter(Boolean);
};

const getMonthKey = (dateKey: string): string => {
  return dateKey.slice(0, 7);
};

const getPreviousMonthKey = (monthKey: string): string => {
  const [yearString, monthString] = monthKey.split('-');
  const year = parseInt(yearString, 10);
  const month = parseInt(monthString, 10);
  const previous = new Date(year, month - 2, 1);

  return `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, '0')}`;
};

const dateDiffInDays = (fromDateKey: string, toDateKey: string): number => {
  const fromTime = parseDateKey(fromDateKey).getTime();
  const toTime = parseDateKey(toDateKey).getTime();
  return Math.floor((toTime - fromTime) / DAY_MS);
};

const resolveTrendDirection = (delta: number): TrendDirection => {
  if (delta >= 0.05) {
    return 'up';
  }
  if (delta <= -0.05) {
    return 'down';
  }

  return 'no-change';
};

const getTopKeyByCount = (map: Map<string, number>): string | null => {
  let bestKey: string | null = null;
  let bestCount = 0;

  for (const [key, count] of map.entries()) {
    if (count > bestCount) {
      bestKey = key;
      bestCount = count;
    }
  }

  return bestKey;
};

const getTopThemes = (map: Map<string, number>, limit: number): string[] => {
  return Array.from(map.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }
      return a[0].localeCompare(b[0]);
    })
    .slice(0, limit)
    .map(([theme]) => theme);
};

const collectThemesForEntry = (entry: Entry): string[] => {
  const themes = new Set<string>();

  for (const tag of entry.tags ?? []) {
    const normalized = tag.trim().toLowerCase();
    if (normalized.length >= 3) {
      themes.add(normalized);
    }
  }

  for (const token of tokenize(entry.text)) {
    if (token.length < 4 || STOP_WORDS.has(token)) {
      continue;
    }
    themes.add(token);
  }

  return Array.from(themes);
};

export const scoreEntrySentiment = (entry: Entry): number => {
  let score = 0;

  for (const token of tokenize(entry.text)) {
    if (POSITIVE_WORDS.has(token)) {
      score += 0.2;
    }
    if (NEGATIVE_WORDS.has(token)) {
      score -= 0.2;
    }
  }

  const mood = entry.mood?.trim().toLowerCase();
  if (mood) {
    if (POSITIVE_MOODS.has(mood)) {
      score += 0.35;
    }
    if (NEGATIVE_MOODS.has(mood)) {
      score -= 0.35;
    }
  }

  return round(clamp(score, -1, 1), 2);
};

const buildSentimentTimelineInsight = (
  entries: Entry[],
  sentimentById: Map<string, number>,
  todayKey: string
): SentimentTimelineInsight => {
  const currentMonthKey = getMonthKey(todayKey);
  const previousMonthKey = getPreviousMonthKey(currentMonthKey);

  const weeklyBuckets: number[][] = [[], [], [], []];
  const currentMonthScores: number[] = [];
  const previousMonthScores: number[] = [];

  for (const entry of entries) {
    const sentiment = sentimentById.get(entry.id) ?? 0;
    const diff = dateDiffInDays(entry.date, todayKey);

    if (diff >= 0 && diff <= 27) {
      const bucket = 3 - Math.floor(diff / 7);
      weeklyBuckets[bucket].push(sentiment);
    }

    const monthKey = getMonthKey(entry.date);
    if (monthKey === currentMonthKey) {
      currentMonthScores.push(sentiment);
    }
    if (monthKey === previousMonthKey) {
      previousMonthScores.push(sentiment);
    }
  }

  const currentMonthAverage = average(currentMonthScores);
  const previousMonthAverage = average(previousMonthScores);
  const monthlyDelta =
    currentMonthAverage !== null && previousMonthAverage !== null
      ? round(currentMonthAverage - previousMonthAverage, 2)
      : 0;

  const direction = resolveTrendDirection(monthlyDelta);
  const weeklyPoints: SentimentTimelinePoint[] = [
    '3 weeks ago',
    '2 weeks ago',
    'Last week',
    'This week'
  ].map((label, index) => {
    const scores = weeklyBuckets[index];
    const pointAverage = average(scores);

    return {
      label,
      average: pointAverage === null ? null : round(pointAverage, 2),
      entries: scores.length
    };
  });

  if (entries.length < MIN_SENTIMENT_ENTRIES) {
    return {
      status: 'insufficient',
      summary: 'Add at least five entries to unlock sentiment trends.',
      weeklyPoints,
      direction,
      monthlyDelta,
      currentMonthAverage,
      previousMonthAverage
    };
  }

  const summary =
    previousMonthAverage === null || currentMonthAverage === null
      ? 'Tracking this month now. Add entries across two months for period comparison.'
      : direction === 'up'
        ? 'Sentiment is trending upward versus last month.'
        : direction === 'down'
          ? 'Sentiment is trending lower versus last month.'
          : 'Sentiment is steady versus last month.';

  return {
    status: 'ready',
    summary,
    weeklyPoints,
    direction,
    monthlyDelta,
    currentMonthAverage,
    previousMonthAverage
  };
};

const buildMoodPatternInsight = (
  entries: Entry[],
  sentimentById: Map<string, number>
): MoodPatternInsight => {
  const weekdayScores: number[] = [];
  const weekendScores: number[] = [];
  const morningScores: number[] = [];
  const afternoonScores: number[] = [];
  const eveningScores: number[] = [];
  const moodCounts = new Map<string, number>();

  for (const entry of entries) {
    const sentiment = sentimentById.get(entry.id) ?? 0;
    const day = parseDateKey(entry.date).getDay();

    if (day === 0 || day === 6) {
      weekendScores.push(sentiment);
    } else {
      weekdayScores.push(sentiment);
    }

    const createdAtHour = new Date(entry.createdAt).getHours();
    const hour = Number.isNaN(createdAtHour) ? 12 : createdAtHour;

    if (hour < 12) {
      morningScores.push(sentiment);
    } else if (hour < 18) {
      afternoonScores.push(sentiment);
    } else {
      eveningScores.push(sentiment);
    }

    const mood = entry.mood?.trim().toLowerCase();
    if (mood) {
      moodCounts.set(mood, (moodCounts.get(mood) ?? 0) + 1);
    }
  }

  const topMood = getTopKeyByCount(moodCounts);
  const weekdayAverage = average(weekdayScores);
  const weekendAverage = average(weekendScores);
  const morningAverage = average(morningScores);
  const eveningAverage = average(eveningScores);
  const afternoonAverage = average(afternoonScores);

  let dayPattern = 'Weekday and weekend sentiment are currently similar.';
  if (weekdayAverage !== null && weekendAverage !== null) {
    const weekendDelta = weekendAverage - weekdayAverage;
    if (weekendDelta >= 0.15) {
      dayPattern = 'Weekend entries trend more positive than weekdays.';
    } else if (weekendDelta <= -0.15) {
      dayPattern = 'Weekday entries trend more positive than weekends.';
    }
  }

  let timePattern = 'No strong time-of-day pattern yet.';
  if (morningAverage !== null && eveningAverage !== null) {
    const morningDelta = morningAverage - eveningAverage;
    if (morningDelta >= 0.15) {
      timePattern = 'Morning check-ins trend more positive than evenings.';
    } else if (morningDelta <= -0.15) {
      timePattern = 'Evening check-ins trend more positive than mornings.';
    } else if (afternoonAverage !== null) {
      timePattern = 'Morning, afternoon, and evening sentiment are fairly balanced.';
    }
  }

  if (entries.length < MIN_PATTERN_ENTRIES) {
    return {
      status: 'insufficient',
      summary: 'Add at least six entries to detect mood patterns.',
      dayPattern,
      timePattern,
      topMood
    };
  }

  const summary = topMood
    ? `Most frequent mood label: ${topMood}.`
    : 'Mood labels are optional. Trends are inferred from entry language.';

  return {
    status: 'ready',
    summary,
    dayPattern,
    timePattern,
    topMood
  };
};

const buildThemeMiningInsight = (
  entries: Entry[],
  sentimentById: Map<string, number>
): ThemeMiningInsight => {
  const themeCounts = new Map<string, number>();
  const themeSentiment = new Map<string, number[]>();

  for (const entry of entries) {
    const themes = collectThemesForEntry(entry);
    const sentiment = sentimentById.get(entry.id) ?? 0;

    for (const theme of themes) {
      themeCounts.set(theme, (themeCounts.get(theme) ?? 0) + 1);
      const scores = themeSentiment.get(theme) ?? [];
      scores.push(sentiment);
      themeSentiment.set(theme, scores);
    }
  }

  const topThemes = getTopThemes(themeCounts, 3);

  if (entries.length < MIN_THEME_ENTRIES || topThemes.length === 0) {
    return {
      status: 'insufficient',
      summary: 'Add more entries and repeated themes to unlock theme mining.',
      topThemes,
      positiveTheme: null,
      challengingTheme: null
    };
  }

  let positiveTheme: string | null = null;
  let positiveAverage = -Infinity;
  let challengingTheme: string | null = null;
  let challengingAverage = Infinity;

  for (const [theme, scores] of themeSentiment.entries()) {
    if (scores.length < 2) {
      continue;
    }

    const scoreAverage = average(scores);
    if (scoreAverage === null) {
      continue;
    }

    if (scoreAverage > positiveAverage && scoreAverage >= 0.1) {
      positiveAverage = scoreAverage;
      positiveTheme = theme;
    }

    if (scoreAverage < challengingAverage && scoreAverage <= -0.1) {
      challengingAverage = scoreAverage;
      challengingTheme = theme;
    }
  }

  const summary =
    topThemes.length > 0
      ? `Recurring themes: ${topThemes.join(', ')}.`
      : 'No recurring themes detected yet.';

  return {
    status: 'ready',
    summary,
    topThemes,
    positiveTheme,
    challengingTheme
  };
};

const buildStreakQualityInsight = (
  entries: Entry[],
  todayKey: string
): StreakQualityInsight => {
  const windowStart = addDays(todayKey, -29);
  const windowDates = new Set(
    entries
      .map((entry) => entry.date)
      .filter((date) => date >= windowStart && date <= todayKey)
  );

  const sortedWindowDates = Array.from(windowDates).sort((a, b) =>
    parseDateKey(a).getTime() - parseDateKey(b).getTime()
  );

  const entriesInLast30Days = sortedWindowDates.length;
  const consistencyScore = Math.round((entriesInLast30Days / 30) * 100);

  const dayIndexes = sortedWindowDates.map((date) => dateDiffInDays(windowStart, date));
  let longestGapDays = dayIndexes.length > 0 ? dayIndexes[0] : 30;

  for (let index = 1; index < dayIndexes.length; index += 1) {
    const gap = dayIndexes[index] - dayIndexes[index - 1] - 1;
    longestGapDays = Math.max(longestGapDays, gap);
  }

  if (dayIndexes.length > 0) {
    longestGapDays = Math.max(longestGapDays, 29 - dayIndexes[dayIndexes.length - 1]);
  }

  const summary =
    consistencyScore >= 80
      ? 'Excellent consistency in the last 30 days.'
      : consistencyScore >= 50
        ? 'Solid consistency with room to tighten gaps.'
        : 'Coverage is light. Short daily entries will quickly lift this score.';

  if (entriesInLast30Days < 4) {
    return {
      status: 'insufficient',
      summary: 'Add at least four entries in a month to score streak quality.',
      consistencyScore,
      entriesInLast30Days,
      longestGapDays
    };
  }

  return {
    status: 'ready',
    summary,
    consistencyScore,
    entriesInLast30Days,
    longestGapDays
  };
};

const buildEarlyWarningInsight = (
  entries: Entry[],
  sentimentById: Map<string, number>
): EarlyWarningInsight => {
  const recentEntries = [...entries]
    .sort((a, b) => parseDateKey(a.date).getTime() - parseDateKey(b.date).getTime())
    .slice(-10);

  const scores = recentEntries.map((entry) => sentimentById.get(entry.id) ?? 0);

  const recentAverage = average(scores.slice(-3));
  const previousAverage = average(scores.slice(-6, -3));

  let currentNegativeRun = 0;
  let longestNegativeRun = 0;

  for (const score of scores) {
    if (score <= -0.35) {
      currentNegativeRun += 1;
      longestNegativeRun = Math.max(longestNegativeRun, currentNegativeRun);
    } else {
      currentNegativeRun = 0;
    }
  }

  const hasWarningSignal =
    longestNegativeRun >= 3 &&
    recentAverage !== null &&
    previousAverage !== null &&
    (recentAverage <= -0.25 || recentAverage - previousAverage <= -0.2);

  if (entries.length < MIN_WARNING_ENTRIES) {
    return {
      status: 'insufficient',
      summary: 'Add at least six entries for trend-window checks.',
      level: 'stable',
      recentAverage,
      previousAverage,
      prompt: 'Keep writing. Trend prompts appear when enough data is available.'
    };
  }

  if (hasWarningSignal) {
    return {
      status: 'ready',
      summary:
        'Recent entries show a sustained lower trend. Consider a short reset and reflection.',
      level: 'watch',
      recentAverage,
      previousAverage,
      prompt: 'What felt heaviest this week, and what is one small support step for tomorrow?'
    };
  }

  return {
    status: 'ready',
    summary: 'No sustained low-trend warning in recent entries.',
    level: 'stable',
    recentAverage,
    previousAverage,
    prompt: 'What routine is helping you stay steady lately?'
  };
};

const buildWeeklyReflectionInsight = (
  entries: Entry[],
  sentimentById: Map<string, number>,
  todayKey: string
): WeeklyReflectionInsight => {
  const weekStart = addDays(todayKey, -6);
  const weekEntries = entries.filter((entry) => entry.date >= weekStart && entry.date <= todayKey);

  const positiveThemes = new Map<string, number>();
  const negativeThemes = new Map<string, number>();
  const weekScores: number[] = [];

  for (const entry of weekEntries) {
    const score = sentimentById.get(entry.id) ?? 0;
    weekScores.push(score);

    const themes = collectThemesForEntry(entry);
    for (const theme of themes) {
      if (score >= 0.1) {
        positiveThemes.set(theme, (positiveThemes.get(theme) ?? 0) + 1);
      }
      if (score <= -0.1) {
        negativeThemes.set(theme, (negativeThemes.get(theme) ?? 0) + 1);
      }
    }
  }

  const wins = getTopThemes(positiveThemes, 2);
  const stressors = getTopThemes(negativeThemes, 2);

  if (weekEntries.length < MIN_WEEKLY_REFLECTION_ENTRIES) {
    return {
      status: 'insufficient',
      summary: 'Log at least three entries this week for reflection summaries.',
      wins,
      stressors,
      prompt: 'What is one sentence you want to remember from this week?'
    };
  }

  const weekAverage = average(weekScores) ?? 0;
  const tone =
    weekAverage >= 0.15 ? 'positive' : weekAverage <= -0.15 ? 'challenging' : 'balanced';

  const summaryParts = [`You logged ${weekEntries.length} entries this week with a ${tone} tone.`];
  if (wins.length > 0) {
    summaryParts.push(`Wins showed up around ${wins.join(' and ')}.`);
  }
  if (stressors.length > 0) {
    summaryParts.push(`Pressure points appeared around ${stressors.join(' and ')}.`);
  }

  const prompt =
    tone === 'positive'
      ? 'What helped this week go well, and how can you repeat it next week?'
      : tone === 'challenging'
        ? 'Which moment felt most draining, and what boundary could reduce it next week?'
        : 'What one change would make next week feel smoother?';

  return {
    status: 'ready',
    summary: summaryParts.join(' '),
    wins,
    stressors,
    prompt
  };
};

const countThemes = (entries: Entry[]): Map<string, number> => {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    for (const theme of collectThemesForEntry(entry)) {
      counts.set(theme, (counts.get(theme) ?? 0) + 1);
    }
  }

  return counts;
};

const buildComparePeriodsInsight = (
  entries: Entry[],
  sentimentById: Map<string, number>,
  todayKey: string
): ComparePeriodsInsight => {
  const currentMonthKey = getMonthKey(todayKey);
  const previousMonthKey = getPreviousMonthKey(currentMonthKey);

  const currentEntries = entries.filter((entry) => getMonthKey(entry.date) === currentMonthKey);
  const previousEntries = entries.filter((entry) => getMonthKey(entry.date) === previousMonthKey);

  const currentScores = currentEntries.map((entry) => sentimentById.get(entry.id) ?? 0);
  const previousScores = previousEntries.map((entry) => sentimentById.get(entry.id) ?? 0);

  const currentAverage = average(currentScores);
  const previousAverage = average(previousScores);
  const sentimentDelta =
    currentAverage !== null && previousAverage !== null
      ? round(currentAverage - previousAverage, 2)
      : 0;

  const direction = resolveTrendDirection(sentimentDelta);

  const currentThemes = countThemes(currentEntries);
  const previousThemes = countThemes(previousEntries);
  const topCurrentTheme = getTopThemes(currentThemes, 1)[0] ?? null;
  const topPreviousTheme = getTopThemes(previousThemes, 1)[0] ?? null;

  if (
    currentEntries.length < MIN_COMPARE_PERIOD_ENTRIES ||
    previousEntries.length < MIN_COMPARE_PERIOD_ENTRIES
  ) {
    return {
      status: 'insufficient',
      summary: 'Need at least three entries in both current and previous months to compare periods.',
      direction,
      sentimentDelta,
      topCurrentTheme,
      topPreviousTheme
    };
  }

  const trendCopy =
    direction === 'up'
      ? 'up'
      : direction === 'down'
        ? 'down'
        : 'flat';

  const themeCopy =
    topCurrentTheme && topPreviousTheme
      ? `Top themes shifted from ${topPreviousTheme} to ${topCurrentTheme}.`
      : 'Theme deltas are still stabilizing.';

  return {
    status: 'ready',
    summary: `Month-over-month sentiment is ${trendCopy}. ${themeCopy}`,
    direction,
    sentimentDelta,
    topCurrentTheme,
    topPreviousTheme
  };
};

export const buildAIInsightsReport = (entries: Entry[], todayKey: string): AIInsightsReport => {
  const sortedEntries = [...entries].sort(
    (a, b) => parseDateKey(a.date).getTime() - parseDateKey(b.date).getTime()
  );

  const sentimentById = new Map<string, number>();
  for (const entry of sortedEntries) {
    sentimentById.set(entry.id, scoreEntrySentiment(entry));
  }

  return {
    sentimentTimeline: buildSentimentTimelineInsight(sortedEntries, sentimentById, todayKey),
    moodPatterns: buildMoodPatternInsight(sortedEntries, sentimentById),
    themeMining: buildThemeMiningInsight(sortedEntries, sentimentById),
    streakQuality: buildStreakQualityInsight(sortedEntries, todayKey),
    earlyWarning: buildEarlyWarningInsight(sortedEntries, sentimentById),
    weeklyReflection: buildWeeklyReflectionInsight(sortedEntries, sentimentById, todayKey),
    comparePeriods: buildComparePeriodsInsight(sortedEntries, sentimentById, todayKey)
  };
};
