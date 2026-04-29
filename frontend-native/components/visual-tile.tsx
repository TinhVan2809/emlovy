import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts } from '@/constants/theme';

type VisualTileProps = {
  label: string;
  tone: string;
  accent: string;
  height: number;
  compact?: boolean;
};

export function VisualTile({ accent, compact = false, height, label, tone }: VisualTileProps) {
  return (
    <View
      style={[
        styles.tile,
        {
          backgroundColor: tone,
          borderRadius: compact ? 18 : 26,
          height,
        },
      ]}>
      <View style={[styles.blobLarge, { backgroundColor: accent }]} />
      <View style={[styles.blobSoft, { backgroundColor: AppColors.surface }]} />
      <View style={[styles.blobSmall, { backgroundColor: accent }]} />

      <Text style={styles.kicker}>{compact ? 'editorial cut' : 'emlovy edit'}</Text>
      <View style={styles.pill}>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  blobLarge: {
    borderRadius: 80,
    height: 160,
    opacity: 0.26,
    position: 'absolute',
    right: -24,
    top: -34,
    width: 160,
  },
  blobSmall: {
    borderRadius: 34,
    bottom: 22,
    height: 68,
    opacity: 0.22,
    position: 'absolute',
    right: 18,
    width: 68,
  },
  blobSoft: {
    borderRadius: 72,
    height: 144,
    left: -36,
    opacity: 0.3,
    position: 'absolute',
    top: 46,
    width: 144,
  },
  kicker: {
    color: AppColors.muted,
    fontFamily: AppFonts.heading,
    fontSize: 11,
    letterSpacing: 1.2,
    paddingHorizontal: 18,
    paddingTop: 18,
    textTransform: 'uppercase',
  },
  label: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 14,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 999,
    bottom: 18,
    left: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: 'absolute',
  },
  tile: {
    borderColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
  },
});
