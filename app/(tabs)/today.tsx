import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { colors } from '../../src/theme/colors';
import { getTodayKey, isToday } from '../../src/domain/date';
import { isEntryEditable } from '../../src/domain/entryRules';
import { createId } from '../../src/utils/id';
import { getEntryRepository } from '../../src/repositories';
import { AdSlot } from '../../src/components/AdSlot';
import type { Entry } from '../../src/types/entry';

const emptyEntry = (dateKey: string): Entry => {
  const now = new Date().toISOString();
  return {
    id: createId(),
    date: dateKey,
    text: '',
    mood: null,
    tags: [],
    createdAt: now,
    updatedAt: now
  };
};

export default function TodayScreen() {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastDateKey, setLastDateKey] = useState(getTodayKey());

  const canEdit = useMemo(() => {
    if (!entry) {
      return false;
    }
    return isEntryEditable(entry.date, lastDateKey);
  }, [entry, lastDateKey]);

  const loadEntry = async (dateKey: string) => {
    setLoading(true);
    const repository = await getEntryRepository();
    const existing = await repository.getEntryByDate(dateKey);
    setEntry(existing ?? emptyEntry(dateKey));
    setLoading(false);
  };

  useEffect(() => {
    loadEntry(lastDateKey).catch((error) => {
      Alert.alert('Unable to load entry', error.message);
      setLoading(false);
    });
  }, [lastDateKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentKey = getTodayKey();
      if (!isToday(lastDateKey)) {
        setLastDateKey(currentKey);
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [lastDateKey]);

  const handleSave = async () => {
    if (!entry) {
      return;
    }
    const repository = await getEntryRepository();
    const now = new Date().toISOString();
    const updatedEntry = {
      ...entry,
      updatedAt: now,
      createdAt: entry.createdAt || now
    };
    await repository.upsertEntry(updatedEntry);
    setEntry(updatedEntry);
  };

  if (loading || !entry) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.dateLabel}>{entry.date}</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today&apos;s Line</Text>
        <TextInput
          style={[styles.input, !canEdit && styles.inputDisabled]}
          placeholder="Write one line for today"
          placeholderTextColor={colors.muted}
          multiline
          editable={canEdit}
          value={entry.text}
          onChangeText={(text) => setEntry({ ...entry, text })}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mood (optional)</Text>
        <TextInput
          style={[styles.input, !canEdit && styles.inputDisabled]}
          placeholder="Calm, energized, reflective"
          placeholderTextColor={colors.muted}
          editable={canEdit}
          value={entry.mood ?? ''}
          onChangeText={(mood) => setEntry({ ...entry, mood })}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tags (comma separated)</Text>
        <TextInput
          style={[styles.input, !canEdit && styles.inputDisabled]}
          placeholder="work, family, focus"
          placeholderTextColor={colors.muted}
          editable={canEdit}
          value={entry.tags?.join(', ') ?? ''}
          onChangeText={(tagsText) =>
            setEntry({
              ...entry,
              tags: tagsText
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
            })
          }
        />
      </View>
      <Pressable
        style={[styles.button, !canEdit && styles.buttonDisabled]}
        onPress={() =>
          handleSave().catch((error) => Alert.alert('Save failed', error.message))
        }
        disabled={!canEdit}
      >
        <Text style={styles.buttonText}>{entry.text ? 'Update' : 'Save'}</Text>
      </Pressable>
      {!canEdit && (
        <Text style={styles.lockedText}>Past entries are read-only.</Text>
      )}
      <AdSlot placement="today-footer" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20
  },
  dateLabel: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 8
  },
  section: {
    marginTop: 16
  },
  sectionTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '600'
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    color: colors.text,
    minHeight: 48
  },
  inputDisabled: {
    opacity: 0.6
  },
  button: {
    marginTop: 20,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  lockedText: {
    marginTop: 12,
    color: colors.muted
  }
});
