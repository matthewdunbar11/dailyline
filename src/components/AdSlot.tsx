import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { useAdVisibility } from '../hooks/useAdVisibility';

type AdSlotProps = {
  placement: string;
};

export const AdSlot = ({ placement }: AdSlotProps) => {
  const { showAds, loading } = useAdVisibility();

  if (loading || !showAds) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Ad</Text>
      <Text style={styles.copy}>Sponsored placement: {placement}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 10
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '600'
  },
  copy: {
    color: colors.text,
    fontSize: 12
  }
});
