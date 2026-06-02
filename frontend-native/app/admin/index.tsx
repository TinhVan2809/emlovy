import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { Routes } from '@/constants/routes';
import { adminApi } from '@/services/api';
import { useAuth } from '@/contexts/auth-context';
import { AppColors, AppFonts } from '@/constants/theme';
import { ScreenShell } from '@/components/screen-shell';


export default function AdminPage() {
  const { user, token, signOut, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    let mounted = true;
    const ensureAdmin = async () => {
      // If we already know the user is admin, skip verification
      if (user && user.role === 'admin') {
        if (mounted) setVerifying(false);
        return;
      }

      // If no token then we can't verify -> redirect
      if (!token) {
        if (mounted) setVerifying(false);
        router.replace(Routes.home);
        return;
      }

      try {
        if (mounted) setVerifying(true);
        const res = await adminApi.check(token);
        if (res?.data?.user?.role === 'admin') {
          // Update user in context with returned fields (merge with existing user)
          try {
            const merged = { ...(user || {}), ...res.data.user } as any;
            updateUser?.(merged);
          } catch (_e) {
            // ignore update errors
          }

          if (mounted) setVerifying(false);
          return;
        }

        router.replace(Routes.home);
      } catch (_err) {
        router.replace(Routes.home);
      } finally {
        if (mounted) setVerifying(false);
      }
    };

    ensureAdmin();
    return () => {
      mounted = false;
    };
  }, [user, token, updateUser]);

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

  if (verifying) {
    return (
      <ScreenShell>
        <View style={{ padding: 20 }}>
          <ActivityIndicator />
          <Text>Đang xác thực quyền admin...</Text>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <View>
        <Text>Day la trang admin</Text>
        <Pressable onPress={signOut}>
          <Text>Dang xuat</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}

// const styles = StyleSheet.create({
//   // 
// });
