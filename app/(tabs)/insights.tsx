import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../src/theme/colors';
import { calculateStreaks } from '../../src/domain/streak';
import { getTodayKey } from '../../src/domain/date';
import { getEntryRepository } from '../../src/repositories';
import type { Entry } from '../../src/types/entry';

export default function InsightsScreen() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [streaks, setStreaks] = useState({ current: 0, longest: 0 });

  useEffect(() => {
    const load = async () => {
      const repository = await getEntryRepository();
      const allEntries = await repository.listEntries();
      setEntries(allEntries);
      setStreaks(calculateStreaks(allEntries, getTodayKey()));
    };

    load().catch((error) => Alert.alert('Insights failed to load', error.message));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Streaks</Text>
      <View style={styles.section}>
        <View style={styles.card}>
          <Text style={styles.label}>Current streak</Text>
          <Text style={styles.value}>{streaks.current} days</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Longest streak</Text>
          <Text style={styles.value}>{streaks.longest} days</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>Entries counted: {entries.length}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20
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
    fontSize: 12
  },
  value: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600'
  }
});
