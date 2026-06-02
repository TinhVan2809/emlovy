import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Routes } from '@/constants/routes';
import { adminApi } from '@/services/api';
import { useAuth } from '@/contexts/auth-context';
import { AppColors, AppFonts } from '@/constants/theme';
import { ScreenShell } from '@/components/screen-shell';


export default function AdminPage() {
  const { user, token, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    // Client-side guard: redirect non-admins back to home
    if (user && user.role !== 'admin') {
      router.replace(Routes.home);
    }
  }, [user]);

  // const checkServer = async () => {
  //   if (!token) return;
  //   setLoading(true);
  //   try {
  //     const res = await adminApi.check(token);
  //     setStatus(res?.data?.message || 'OK');
  //   } catch (err: any) {
  //     setStatus(err?.message || 'Unauthorized');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <ScreenShell>
      <View>
      <Text>Day la trang admin</Text>
      <Pressable onPress={signOut}>
        <Text>
          Dang xuat
        </Text>
      </Pressable>
    </View>
    </ScreenShell>
  );
}

// const styles = StyleSheet.create({
//   // 
// });
