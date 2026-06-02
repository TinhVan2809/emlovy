import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { AppColors } from '@/constants/theme';
import { Routes } from '@/constants/routes';

export default function AuthLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={AppColors.accent} />
      </View>
    );
  }

  if (isAuthenticated) {
    // Prefer routing admins to the admin panel
    if (user?.role === 'admin') {
      return <Redirect href={Routes.admin} />;
    }

    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: AppColors.background },
        headerShown: false,
      }}
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: AppColors.background,
    flex: 1,
    justifyContent: 'center',
  },
});
