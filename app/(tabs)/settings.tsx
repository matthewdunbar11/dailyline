import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../src/theme/colors';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.text}>Reminder and export controls land here in Sprint 2.</Text>
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderColor: colors.border,
    borderWidth: 1
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8
  },
  text: {
    color: colors.muted
  }
});
