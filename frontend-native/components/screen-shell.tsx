import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors, AppFonts } from '@/constants/theme';

type ScreenShellProps = {
  children: ReactNode;
  title?: string;
  titleNode?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
};

export function ScreenShell({ children, left, right, title, titleNode }: ScreenShellProps) {
  const headerLeft = left ?? titleNode ?? (title ? <Text style={styles.title}>{title}</Text> : null);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>{headerLeft}</View>
        <View style={styles.headerRight}>{right}</View>
      </View>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: AppColors.background,
    borderBottomColor: AppColors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingBottom: 12,
    paddingHorizontal: 18,
    paddingTop: 6,
  },
  headerLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'flex-end',
    minWidth: 72,
  },
  safeArea: {
    backgroundColor: AppColors.background,
    flex: 1,
  },
  title: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 22,
  },
});
