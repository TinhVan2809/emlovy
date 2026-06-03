import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { ScreenShell } from '@/components/screen-shell';
import { adminApi } from '@/services/api';
import { useAuth } from '@/contexts/auth-context';

type DashboardStatus = {
  totalUsers: number;
  newUsersToday: number;
  totalPosts: number;
  totalReels: number;
  totalComments?: number;
  totalLikes?: number;
  totalReports?: number;
};

export default function AdminHome() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let mounted = true;

    const handleGetDashboardStatus = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await adminApi.getDashboardStatus(token);
        if (mounted) setDashboard(response.data as DashboardStatus);
      } catch (err: any) {
        console.error(err);
        if (mounted) setError(err?.message || 'Không thể tải dữ liệu');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    handleGetDashboardStatus();
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <ScreenShell title="Admin">
      <View style={{ padding: 18 }}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <>
            <Text style={{ fontSize: 16 }}>Admin Home</Text>
            {dashboard && (
              <View style={{ marginTop: 12 }}>
                <Text>Total Users: {dashboard.totalUsers}</Text>
                <Text>New Today: {dashboard.newUsersToday}</Text>
                <Text>Total Posts: {dashboard.totalPosts}</Text>
                <Text>Total Reels: {dashboard.totalReels}</Text>
              </View>
            )}
            {error && <Text style={{ color: 'red' }}>{error}</Text>}
          </>
        )}
      </View>
    </ScreenShell>
  );
}
