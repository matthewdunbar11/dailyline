import { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from 'react-native';
import { colors } from '../../src/theme/colors';
import { useSettings } from '../../src/hooks/useSettings';

const formatTimeUnit = (value: number): string => {
  return value.toString().padStart(2, '0');
};

const parseTimeInput = (value: string, max: number): number => {
  const num = parseInt(value.replace(/[^0-9]/g, ''), 10);
  if (isNaN(num)) return 0;
  return Math.min(Math.max(num, 0), max);
};

export default function SettingsScreen() {
  const { settings, loading, updateSettings } = useSettings();
  const [localHour, setLocalHour] = useState<string>('');
  const [localMinute, setLocalMinute] = useState<string>('');

  const handleToggleReminder = async (enabled: boolean) => {
    await updateSettings({ reminderEnabled: enabled });
  };

  const handleHourChange = (text: string) => {
    setLocalHour(text);
    const hour = parseTimeInput(text, 23);
    if (text.length >= 2 || (hour > 2 && text !== '')) {
      updateSettings({ reminderHour: hour });
    }
  };

  const handleMinuteChange = (text: string) => {
    setLocalMinute(text);
    const minute = parseTimeInput(text, 59);
    if (text.length >= 2 || (minute > 5 && text !== '')) {
      updateSettings({ reminderMinute: minute });
    }
  };

  const handleHourBlur = () => {
    if (settings) {
      setLocalHour('');
      updateSettings({ reminderHour: settings.reminderHour });
    }
  };

  const handleMinuteBlur = () => {
    if (settings) {
      setLocalMinute('');
      updateSettings({ reminderMinute: settings.reminderMinute });
    }
  };

  if (loading || !settings) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  const displayHour = localHour !== '' ? localHour : formatTimeUnit(settings.reminderHour);
  const displayMinute = localMinute !== '' ? localMinute : formatTimeUnit(settings.reminderMinute);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reminders</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Daily Reminder</Text>
            <Switch
              value={settings.reminderEnabled}
              onValueChange={handleToggleReminder}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#FFFFFF"
            />
          </View>

          {settings.reminderEnabled && (
            <View style={styles.timePickerContainer}>
              <Text style={styles.timeLabel}>Reminder Time</Text>
              <View style={styles.timeInputRow}>
                <TextInput
                  style={styles.timeInput}
                  value={displayHour}
                  onChangeText={handleHourChange}
                  onBlur={handleHourBlur}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                />
                <Text style={styles.timeSeparator}>:</Text>
                <TextInput
                  style={styles.timeInput}
                  value={displayMinute}
                  onChangeText={handleMinuteChange}
                  onBlur={handleMinuteBlur}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                />
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export</Text>
        <View style={styles.card}>
          <Text style={styles.text}>Export functionality coming in Sprint 2.</Text>
        </View>
      </View>
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
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderColor: colors.border,
    borderWidth: 1
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontSize: 16,
    color: colors.text
  },
  text: {
    color: colors.muted
  },
  timePickerContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  timeLabel: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 8
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  timeInput: {
    width: 56,
    height: 48,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: colors.text
  },
  timeSeparator: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginHorizontal: 8
  }
});
