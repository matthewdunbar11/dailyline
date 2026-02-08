import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { calculateStreaks } from '../../src/domain/streak';
import { getTodayKey } from '../../src/domain/date';
import { getEntryRepository } from '../../src/repositories';
import { AdSlot } from '../../src/components/AdSlot';
import { useSettings } from '../../src/hooks/useSettings';
import { useEntitlement } from '../../src/hooks/useEntitlement';
import { getFeatureAccess, type FeatureKey } from '../../src/services/featureAccess';
import { buildAIInsightsReport, type AIInsightsReport } from '../../src/services/aiInsights';
import type { Entry } from '../../src/types/entry';

type CardContent = {
  status: 'ready' | 'insufficient';
  summary: string;
  details: string[];
};

type AiCardDefinition = {
  key: FeatureKey;
  title: string;
  lockedPreview: string;
  build: (report: AIInsightsReport) => CardContent;
};

const formatScore = (value: number | null): string => {
  if (value === null) {
    return 'n/a';
  }

  return value.toFixed(2);
};

const formatSignedNumber = (value: number): string => {
  if (value > 0) {
    return `+${value.toFixed(2)}`;
  }
  if (value < 0) {
    return value.toFixed(2);
  }

  return '0.00';
};

const getMonthConsistency = (entries: Entry[], todayKey: string) => {
  const [yearString, monthString] = todayKey.split('-');
  const year = parseInt(yearString, 10);
  const month = parseInt(monthString, 10);
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthPrefix = `${yearString}-${monthString}`;

  const daysWithEntries = new Set(
    entries
      .map((entry) => entry.date)
      .filter((dateKey) => dateKey.startsWith(monthPrefix))
  ).size;

  return {
    daysWithEntries,
    daysInMonth
  };
};

const AI_CARD_DEFINITIONS: AiCardDefinition[] = [
  {
    key: 'insights.ai.sentimentTimeline',
    title: 'AI Sentiment Timeline',
    lockedPreview: 'See weekly and month-over-month sentiment changes from your entries.',
    build: (report) => ({
      status: report.sentimentTimeline.status,
      summary: report.sentimentTimeline.summary,
      details: [
        `Direction: ${report.sentimentTimeline.direction}`,
        `Month delta: ${formatSignedNumber(report.sentimentTimeline.monthlyDelta)}`,
        ...report.sentimentTimeline.weeklyPoints.map(
          (point) => `${point.label}: ${formatScore(point.average)} (${point.entries} entries)`
        )
      ]
    })
  },
  {
    key: 'insights.ai.moodPatterns',
    title: 'AI Mood Patterns',
    lockedPreview: 'Detect day-of-week and time-of-day mood patterns.',
    build: (report) => ({
      status: report.moodPatterns.status,
      summary: report.moodPatterns.summary,
      details: [
        report.moodPatterns.dayPattern,
        report.moodPatterns.timePattern,
        `Top mood: ${report.moodPatterns.topMood ?? 'n/a'}`
      ]
    })
  },
  {
    key: 'insights.ai.themeMining',
    title: 'AI Theme Mining',
    lockedPreview: 'Find recurring topics and how they align with your sentiment shifts.',
    build: (report) => ({
      status: report.themeMining.status,
      summary: report.themeMining.summary,
      details: [
        `Themes: ${report.themeMining.topThemes.join(', ') || 'n/a'}`,
        `Positive theme: ${report.themeMining.positiveTheme ?? 'n/a'}`,
        `Challenging theme: ${report.themeMining.challengingTheme ?? 'n/a'}`
      ]
    })
  },
  {
    key: 'insights.ai.streakQuality',
    title: 'AI Streak Quality',
    lockedPreview: 'Track consistency quality, not just streak length.',
    build: (report) => ({
      status: report.streakQuality.status,
      summary: report.streakQuality.summary,
      details: [
        `Consistency score: ${report.streakQuality.consistencyScore}/100`,
        `Entries in last 30 days: ${report.streakQuality.entriesInLast30Days}`,
        `Longest gap in last 30 days: ${report.streakQuality.longestGapDays} days`
      ]
    })
  },
  {
    key: 'insights.ai.earlyWarning',
    title: 'AI Early Warning Signals',
    lockedPreview: 'Detect sustained low-trend windows with gentle, non-clinical prompts.',
    build: (report) => ({
      status: report.earlyWarning.status,
      summary: report.earlyWarning.summary,
      details: [
        `Level: ${report.earlyWarning.level}`,
        `Recent average: ${formatScore(report.earlyWarning.recentAverage)}`,
        `Previous window: ${formatScore(report.earlyWarning.previousAverage)}`,
        `Prompt: ${report.earlyWarning.prompt}`
      ]
    })
  },
  {
    key: 'insights.ai.weeklyReflection',
    title: 'AI Weekly Reflection',
    lockedPreview: 'Generate a weekly summary of wins, stressors, and a reflection prompt.',
    build: (report) => ({
      status: report.weeklyReflection.status,
      summary: report.weeklyReflection.summary,
      details: [
        `Wins: ${report.weeklyReflection.wins.join(', ') || 'n/a'}`,
        `Stressors: ${report.weeklyReflection.stressors.join(', ') || 'n/a'}`,
        `Prompt: ${report.weeklyReflection.prompt}`
      ]
    })
  },
  {
    key: 'insights.ai.comparePeriods',
    title: 'AI Compare Periods',
    lockedPreview: 'Compare this month versus last month for sentiment and theme shifts.',
    build: (report) => ({
      status: report.comparePeriods.status,
      summary: report.comparePeriods.summary,
      details: [
        `Direction: ${report.comparePeriods.direction}`,
        `Sentiment delta: ${formatSignedNumber(report.comparePeriods.sentimentDelta)}`,
        `Current top theme: ${report.comparePeriods.topCurrentTheme ?? 'n/a'}`,
        `Previous top theme: ${report.comparePeriods.topPreviousTheme ?? 'n/a'}`
      ]
    })
  }
];

export default function InsightsScreen() {
  const router = useRouter();
  const todayKey = getTodayKey();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const { settings, loading: settingsLoading } = useSettings();
  const { entitlementState, loading: entitlementLoading } = useEntitlement();

  useEffect(() => {
    const load = async () => {
      setLoadingEntries(true);
      const repository = await getEntryRepository();
      const allEntries = await repository.listEntries();
      setEntries(allEntries);
      setLoadingEntries(false);
    };

    load().catch((error) => {
      Alert.alert('Insights failed to load', error.message);
      setLoadingEntries(false);
    });
  }, []);

  const streaks = useMemo(() => calculateStreaks(entries, todayKey), [entries, todayKey]);

  const monthConsistency = useMemo(() => getMonthConsistency(entries, todayKey), [entries, todayKey]);

  const aiReport = useMemo(() => buildAIInsightsReport(entries, todayKey), [entries, todayKey]);

  const aiCards = useMemo(() => {
    const context = {
      entitlement: entitlementState?.status ?? 'unknown',
      aiInsightsEnabled: settings?.aiInsightsEnabled ?? false,
      lastKnownEntitlement: entitlementState?.lastKnownStatus
    };

    return AI_CARD_DEFINITIONS.map((definition) => {
      const access = getFeatureAccess(definition.key, context);
      return {
        key: definition.key,
        title: definition.title,
        lockedPreview: definition.lockedPreview,
        access,
        content: definition.build(aiReport)
      };
    }).filter((card) => card.access !== 'hidden');
  }, [aiReport, entitlementState?.lastKnownStatus, entitlementState?.status, settings?.aiInsightsEnabled]);

  if (loadingEntries || settingsLoading || entitlementLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Core Insights</Text>
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.label}>Current streak</Text>
            <Text style={styles.value}>{streaks.current} days</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Longest streak</Text>
            <Text style={styles.value}>{streaks.longest} days</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Monthly consistency</Text>
            <Text style={styles.value}>
              {monthConsistency.daysWithEntries}/{monthConsistency.daysInMonth} days
            </Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Entries counted: {entries.length}</Text>

        {aiCards.length > 0 && (
          <View style={styles.aiSection}>
            <Text style={styles.title}>AI Insights</Text>
            {aiCards.map((card) => (
              <View key={card.key} style={styles.card}>
                <Text style={styles.aiTitle}>{card.title}</Text>
                {card.access === 'locked' ? (
                  <>
                    <Text style={styles.label}>{card.lockedPreview}</Text>
                    <Pressable
                      style={({ pressed }) => [
                        styles.upgradeButton,
                        pressed && styles.upgradeButtonPressed
                      ]}
                      onPress={() => {
                        router.push('/settings');
                      }}
                    >
                      <Text style={styles.upgradeButtonText}>Upgrade in Settings</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Text style={styles.label}>
                      {card.content.status === 'insufficient'
                        ? `Insufficient data: ${card.content.summary}`
                        : card.content.summary}
                    </Text>
                    {card.content.details.map((detail) => (
                      <Text key={`${card.key}-${detail}`} style={styles.detail}>
                        {detail}
                      </Text>
                    ))}
                  </>
                )}
              </View>
            ))}
          </View>
        )}
        <AdSlot placement="insights-footer" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20
  },
  content: {
    paddingBottom: 32
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16
  },
  section: {
    gap: 16
  },
  subtitle: {
    marginTop: 16,
    color: colors.muted,
    fontSize: 12
  },
  aiSection: {
    marginTop: 24,
    gap: 16
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderColor: colors.border,
    borderWidth: 1,
    marginBottom: 0
  },
  label: {
    color: colors.muted,
    marginBottom: 8,
    fontSize: 13,
    lineHeight: 18
  },
  detail: {
    color: colors.text,
    marginTop: 6,
    fontSize: 13
  },
  value: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600'
  },
  aiTitle: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 15
  },
  upgradeButton: {
    marginTop: 4,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  upgradeButtonPressed: {
    opacity: 0.85
  },
  upgradeButtonText: {
    color: colors.text,
    fontWeight: '600'
  }
});
