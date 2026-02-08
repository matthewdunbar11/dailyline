import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { Link } from 'expo-router';
import { colors } from '../../../src/theme/colors';
import { filterEntries } from '../../../src/domain/search';
import { getEntryRepository } from '../../../src/repositories';
import { AdSlot } from '../../../src/components/AdSlot';
import type { Entry } from '../../../src/types/entry';

const getMonthLabel = (date: Date) =>
  date.toLocaleString('en-US', { month: 'long', year: 'numeric' });

const getMonthDays = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const offset = firstDay.getDay();

  return { daysInMonth, offset, year, month };
};

export default function HistoryScreen() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [entryDates, setEntryDates] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [monthCursor, setMonthCursor] = useState(new Date());

  const loadEntries = async () => {
    const repository = await getEntryRepository();
    const allEntries = await repository.listEntries();
    const dates = await repository.getEntryDates();
    setEntries(allEntries);
    setEntryDates(dates);
  };

  useEffect(() => {
    loadEntries().catch((error) => Alert.alert('History load failed', error.message));
  }, []);

  const filteredEntries = useMemo(
    () => filterEntries(entries, query, selectedDate),
    [entries, query, selectedDate]
  );

  const { daysInMonth, offset, year, month } = getMonthDays(monthCursor);
  const entryDateSet = useMemo(() => new Set(entryDates), [entryDates]);

  const previousMonth = () => {
    setMonthCursor(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setMonthCursor(new Date(year, month + 1, 1));
  };

  const renderCalendarDays = () => {
    const placeholders = Array.from({ length: offset }).map((_, index) => (
      <View key={`placeholder-${index}`} style={styles.calendarCell} />
    ));

    const days = Array.from({ length: daysInMonth }).map((_, index) => {
      const day = index + 1;
      const dateKey = new Date(year, month, day)
        .toISOString()
        .slice(0, 10);
      const hasEntry = entryDateSet.has(dateKey);
      const isSelected = selectedDate === dateKey;

      return (
        <Pressable
          key={dateKey}
          style={[
            styles.calendarCell,
            hasEntry && styles.calendarCellActive,
            isSelected && styles.calendarCellSelected
          ]}
          onPress={() => setSelectedDate(isSelected ? undefined : dateKey)}
        >
          <Text style={styles.calendarCellText}>{day}</Text>
        </Pressable>
      );
    });

    return [...placeholders, ...days];
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.calendarHeader}>
          <Pressable onPress={previousMonth}>
            <Text style={styles.navButton}>
              {'<'}
            </Text>
          </Pressable>
          <Text style={styles.monthLabel}>{getMonthLabel(monthCursor)}</Text>
          <Pressable onPress={nextMonth}>
            <Text style={styles.navButton}>
              {'>'}
            </Text>
          </Pressable>
        </View>
        <View style={styles.calendarGrid}>{renderCalendarDays()}</View>
      </View>
      <View style={styles.section}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search your entries"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
        />
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {filteredEntries.map((entry) => (
          <Link
            key={entry.id}
            href={{ pathname: '/history/[date]', params: { date: entry.date } }}
            asChild
          >
            <Pressable style={styles.entryCard}>
              <Text style={styles.entryDate}>{entry.date}</Text>
              <Text style={styles.entryText} numberOfLines={2}>
                {entry.text}
              </Text>
            </Pressable>
          </Link>
        ))}
        {filteredEntries.length === 0 && (
          <Text style={styles.emptyText}>
            No entries yet. Your saved lines will appear here.
          </Text>
        )}
        <AdSlot placement="history-list-footer" />
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
  section: {
    marginTop: 16
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text
  },
  navButton: {
    fontSize: 18,
    color: colors.accent
  },
  calendarGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  calendarCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderRadius: 12
  },
  calendarCellActive: {
    backgroundColor: colors.calendarHighlight
  },
  calendarCellSelected: {
    borderColor: colors.accent,
    borderWidth: 1
  },
  calendarCellText: {
    color: colors.text,
    fontSize: 12
  },
  searchInput: {
    marginTop: 16,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    color: colors.text
  },
  list: {
    paddingVertical: 16,
    gap: 16
  },
  entryCard: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    borderColor: colors.border,
    borderWidth: 1
  },
  entryDate: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4
  },
  entryText: {
    fontSize: 14,
    color: colors.text
  },
  emptyText: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 32
  }
});
