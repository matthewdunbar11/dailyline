import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors } from '../../../src/theme/colors';
import { getEntryRepository } from '../../../src/repositories';
import type { Entry } from '../../../src/types/entry';

export default function EntryDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [entry, setEntry] = useState<Entry | null>(null);

  useEffect(() => {
    const loadEntry = async () => {
      if (!date) {
        return;
      }
      const repository = await getEntryRepository();
      const existing = await repository.getEntryByDate(date);
      setEntry(existing ?? null);
    };

    loadEntry().catch((error) => Alert.alert('Unable to load entry', error.message));
  }, [date]);

  return (
    <SafeAreaView style={styles.container}>
      {entry ? (
        <View style={styles.card}>
          <Text style={styles.date}>{entry.date}</Text>
          <Text style={styles.text}>{entry.text}</Text>
          {entry.mood ? <Text style={styles.meta}>Mood: {entry.mood}</Text> : null}
          {entry.tags && entry.tags.length > 0 ? (
            <Text style={styles.meta}>Tags: {entry.tags.join(', ')}</Text>
          ) : null}
        </View>
      ) : (
        <Text style={styles.emptyText}>No entry found for this day.</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderColor: colors.border,
    borderWidth: 1
  },
  date: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 8
  },
  text: {
    fontSize: 14,
    color: colors.text
  },
  meta: {
    marginTop: 12,
    color: colors.muted
  },
  emptyText: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 32
  }
});
