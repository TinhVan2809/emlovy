import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Routes } from '@/constants/routes';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={AppColors.accent} />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? Routes.home : Routes.login} />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: AppColors.background,
    flex: 1,
    justifyContent: 'center',
  },
});
