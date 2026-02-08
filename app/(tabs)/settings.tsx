import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from 'react-native';
import { colors } from '../../src/theme/colors';
import { useSettings } from '../../src/hooks/useSettings';
import { useEntitlement } from '../../src/hooks/useEntitlement';
import { exportDataToFile } from '../../src/services/exportService';
import { getFeatureAccess } from '../../src/services/featureAccess';
import { AdSlot } from '../../src/components/AdSlot';
import { getEntitlementRepository } from '../../src/repositories';
import type { EntitlementStatus } from '../../src/services/iap';
import {
  scheduleDailyReminder,
  type ReminderPermissionStatus
} from '../../src/services/notifications';

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
  const {
    entitlementState,
    effectiveEntitlement,
    premiumProduct,
    loading: entitlementLoading,
    actionInFlight,
    statusMessage,
    refreshEntitlement,
    purchasePremium,
    restorePremium
  } = useEntitlement();
  const [localHour, setLocalHour] = useState<string>('');
  const [localMinute, setLocalMinute] = useState<string>('');
  const [reminderStatus, setReminderStatus] = useState<ReminderPermissionStatus | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const previousEntitlementRef = useRef<'free' | 'premium'>(effectiveEntitlement);

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

  useEffect(() => {
    if (!settings) return;
    let isActive = true;

    const syncReminder = async () => {
      setIsScheduling(true);
      const result = await scheduleDailyReminder(settings);
      if (!isActive) return;
      setReminderStatus(result.permissionStatus);
      setIsScheduling(false);
    };

    syncReminder();

    return () => {
      isActive = false;
    };
  }, [settings?.reminderEnabled, settings?.reminderHour, settings?.reminderMinute]);

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus(null);
    try {
      const result = await exportDataToFile();
      setExportStatus(
        result.shared
          ? 'Export ready to share.'
          : `Export saved to ${result.uri}. Share manually if needed.`
      );
    } catch (error) {
      setExportStatus('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleToggleAiInsights = async (enabled: boolean) => {
    await updateSettings({ aiInsightsEnabled: enabled });
  };

  useEffect(() => {
    if (!settings) {
      return;
    }

    const previousEntitlement = previousEntitlementRef.current;
    const unlockedPremium =
      previousEntitlement !== 'premium' && effectiveEntitlement === 'premium';

    if (unlockedPremium && !settings.aiInsightsEnabled) {
      updateSettings({ aiInsightsEnabled: true }).catch(() => undefined);
    }

    previousEntitlementRef.current = effectiveEntitlement;
  }, [effectiveEntitlement, settings, updateSettings]);

  if (loading || !settings) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  const displayHour = localHour !== '' ? localHour : formatTimeUnit(settings.reminderHour);
  const displayMinute = localMinute !== '' ? localMinute : formatTimeUnit(settings.reminderMinute);

  const restoreAccess = getFeatureAccess('settings.restorePurchase', {
    entitlement: entitlementState?.status ?? 'unknown',
    aiInsightsEnabled: settings.aiInsightsEnabled,
    lastKnownEntitlement: entitlementState?.lastKnownStatus
  });

  const showRestoreButton = restoreAccess === 'enabled';
  const isPremium = effectiveEntitlement === 'premium';
  const planLabel = isPremium ? 'Premium' : 'Free';
  const upgradeCta =
    actionInFlight === 'purchase'
      ? 'Processing...'
      : isPremium
        ? 'Premium Active'
        : 'Upgrade to Premium';
  const restoreCta =
    actionInFlight === 'restore' ? 'Restoring...' : 'Restore Purchases';
  const showTestingControls = process.env.NODE_ENV !== 'production';

  const handleSimulateEntitlement = async (status: EntitlementStatus) => {
    const repository = await getEntitlementRepository();
    await repository.setEntitlement(status);
    if (status === 'premium' && !settings.aiInsightsEnabled) {
      await updateSettings({ aiInsightsEnabled: true });
    }
    await refreshEntitlement();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
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
              {isScheduling && <Text style={styles.helperText}>Updating reminder...</Text>}
              {reminderStatus === 'denied' && (
                <Text style={styles.warningText}>
                  Notifications are disabled. Enable them in system settings to receive reminders.
                </Text>
              )}
              {reminderStatus === 'unavailable' && (
                <Text style={styles.warningText}>
                  Notifications are unavailable on this device.
                </Text>
              )}
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Premium</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Current Plan: {planLabel}</Text>
          {premiumProduct?.available && premiumProduct.price ? (
            <Text style={styles.helperText}>Lifetime unlock: {premiumProduct.price}</Text>
          ) : (
            <Text style={styles.helperText}>
              Premium pricing is currently unavailable in this environment.
            </Text>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.exportButton,
              pressed && styles.exportButtonPressed,
              (actionInFlight !== null || isPremium || entitlementLoading) &&
                styles.exportButtonDisabled
            ]}
            onPress={() => {
              purchasePremium();
            }}
            disabled={actionInFlight !== null || isPremium || entitlementLoading}
          >
            <Text style={styles.exportButtonText}>{upgradeCta}</Text>
          </Pressable>
          {showRestoreButton && (
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.exportButtonPressed,
                (actionInFlight !== null || entitlementLoading) &&
                  styles.exportButtonDisabled
              ]}
              onPress={() => {
                restorePremium();
              }}
              disabled={actionInFlight !== null || entitlementLoading}
            >
              <Text style={styles.secondaryButtonText}>{restoreCta}</Text>
            </Pressable>
          )}
          {entitlementState?.status === 'unknown' && (
            <Text style={styles.helperText}>
              Store status is temporarily unavailable. Last known plan: {entitlementState.lastKnownStatus}.
            </Text>
          )}
          {statusMessage && <Text style={styles.helperText}>{statusMessage}</Text>}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export</Text>
        <View style={styles.card}>
          <Text style={styles.text}>Create a JSON backup of your entries and settings.</Text>
          <Pressable
            style={({ pressed }) => [
              styles.exportButton,
              pressed && styles.exportButtonPressed,
              isExporting && styles.exportButtonDisabled
            ]}
            onPress={handleExport}
            disabled={isExporting}
          >
            <Text style={styles.exportButtonText}>
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Text>
          </Pressable>
          {exportStatus && <Text style={styles.helperText}>{exportStatus}</Text>}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Insights</Text>
        <View style={styles.card}>
          <Pressable
            style={styles.row}
            onPress={() => {
              if (!isPremium) {
                return;
              }
              handleToggleAiInsights(!settings.aiInsightsEnabled).catch(() => undefined);
            }}
          >
            <Text style={styles.label}>Enable AI Insights</Text>
            <Switch
              value={settings.aiInsightsEnabled}
              onValueChange={(enabled) => {
                handleToggleAiInsights(enabled).catch(() => undefined);
              }}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#FFFFFF"
              disabled={!isPremium}
            />
          </Pressable>
          <Text style={styles.helperText}>
            All AI processing stays on-device and uses only your local journal data.
          </Text>
          {!isPremium && (
            <Text style={styles.helperText}>
              Upgrade to Premium to unlock AI cards in the Insights tab.
            </Text>
          )}
          {isPremium && !settings.aiInsightsEnabled && (
            <Text style={styles.helperText}>
              AI cards are currently hidden in Insights. Re-enable this toggle at any time.
            </Text>
          )}
        </View>
      </View>
      {showTestingControls && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Testing Controls</Text>
          <View style={styles.card}>
            <Text style={styles.helperText}>
              Debug-only controls for entitlement smoke tests.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.exportButtonPressed
              ]}
              onPress={() => {
                handleSimulateEntitlement('free').catch(() => undefined);
              }}
            >
              <Text style={styles.secondaryButtonText}>Simulate Free</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.exportButtonPressed
              ]}
              onPress={() => {
                handleSimulateEntitlement('premium').catch(() => undefined);
              }}
            >
              <Text style={styles.secondaryButtonText}>Simulate Premium</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.exportButtonPressed
              ]}
              onPress={() => {
                handleSimulateEntitlement('unknown').catch(() => undefined);
              }}
            >
              <Text style={styles.secondaryButtonText}>Simulate Unknown</Text>
            </Pressable>
          </View>
        </View>
      )}
      <AdSlot placement="settings-footer" />
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
  helperText: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 13
  },
  warningText: {
    marginTop: 12,
    color: colors.accent,
    fontSize: 13
  },
  exportButton: {
    marginTop: 12,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  exportButtonPressed: {
    opacity: 0.85
  },
  exportButtonDisabled: {
    opacity: 0.6
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  secondaryButton: {
    marginTop: 12,
    borderColor: colors.border,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.background
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '600'
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
