import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  View,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
} from "react-native";
import { ScreenShell } from "@/components/screen-shell";
import { adminApi } from "@/services/api";
import { useAuth } from "@/contexts/auth-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { dashboardRoute } from "@/constants/admin-routes";

type DashboardStatus = {
  totalUsers: number;
  newUsersToday: number;
  totalPosts: number;
  totalReels: number;
  totalComments?: number;
  totalLikes?: number;
  totalReports?: number;
};

// Card component to display each dashboard item
export function DashboardCard({ item }: { item: [string, number] }) {
  const [key, value] = item;
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    totalUsers: "people",
    newUsersToday: "person-add",
    totalPosts: "document-text",
    totalReels: "videocam",
    totalComments: "chatbubbles",
    totalLikes: "heart",
    totalReports: "warning",
  };

  // Map lại tên hiển thị cho thân thiện hơn
  const labelMap: Record<string, string> = {
    totalUsers: "Người dùng",
    newUsersToday: "Mới hôm nay",
    totalPosts: "Bài viết",
    totalReels: "Reels",
    totalComments: "Bình luận",
    totalLikes: "Yêu thích",
    totalReports: "Báo cáo",
  };

  const iconName = iconMap[key] || "stats-chart";
  const label = labelMap[key] || key;
  // per-key icon color map (used for the icon `color` prop)
  const iconColorMap: Record<string, string> = {
    totalUsers: "#4A90E2",
    newUsersToday: "#50E3C2",
    totalPosts: "#F5A623",
    totalReels: "#FF4757",
    totalComments: "#7470AF",
    totalLikes: "#ED4C67",
    totalReports: "#F79F1F",
  };

  const iconColor = iconColorMap[key] || "#333";
  const iconStyleKey = `${key}Icon`;
  // dynamic style lookup - falls back to `styles.icon`
  const dynamicIconStyle = (styles as any)[iconStyleKey] || styles.icon;
  // map dashboard keys to admin routes (let TS infer proper Href type)
  const routeMap = {
    totalUsers: dashboardRoute.users,
    newUsersToday: dashboardRoute.users,
    totalPosts: dashboardRoute.posts,
    totalReels: dashboardRoute.reels,
  };

  const targetRoute = (routeMap as any)[key];

  return (
    <Pressable
      style={[styles.card, styles[key as keyof typeof styles]]}
      onPress={() => {
        if (targetRoute) {
          router.push(targetRoute);
        }
      }}
    >
      <View style={styles.title}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Ionicons
          name={iconName as any}
          size={24}
          color={iconColor}
          style={dynamicIconStyle}
        />
      </View>
      <Text style={styles.cardValue}>{value}</Text>
    </Pressable>
  );
}

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
        if (mounted) setError(err?.message || "Không thể tải dữ liệu");
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
    <ScreenShell
      title="Dashbroad"
      right={
        <Pressable style={styles.searchBox}>
          <TextInput placeholder="Search for..." style={styles.input} />
          <Ionicons name="search-outline" size={24} />
        </Pressable>
      }
    >
      <View style={{ padding: 18 }}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <>
            {dashboard && (
              <FlatList
                data={Object.entries(dashboard)}
                keyExtractor={([key]) => key}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => <DashboardCard item={item} />}
              />
            )}
            {error && <Text style={{ color: "red" }}>{error}</Text>}
          </>
        )}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.3,
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  input: {
    width: 200,
  },
  listContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    width: "48%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    gap: 20,
    elevation: 3,
  },
  title: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  cardLabel: {
    fontSize: 16,
    marginTop: 8,
    fontWeight: "bold",
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
  },
  // Định nghĩa style riêng cho từng key ở đây
  totalUsers: { borderLeftColor: "#4A90E2", borderLeftWidth: 4 },
  newUsersToday: { borderLeftColor: "#50E3C2", borderLeftWidth: 4 },
  totalPosts: { borderLeftColor: "#F5A623", borderLeftWidth: 4 },
  totalReels: { borderLeftColor: "#FF4757", borderLeftWidth: 4 },
  totalComments: { borderLeftColor: "#7470AF", borderLeftWidth: 4 },
  totalLikes: { borderLeftColor: "#ED4C67", borderLeftWidth: 4 },
  totalReports: { borderLeftColor: "#F79F1F", borderLeftWidth: 4 },
  // default icon style
  icon: {
    marginLeft: 8,
  },
  // optional per-key icon style placeholders (can customize further)
  totalUsersIcon: {
    backgroundColor: "#4a91e269",
    padding: 10,
    borderRadius: 15,
  },
  newUsersTodayIcon: {
    backgroundColor: "#50e3c360",
    padding: 10,
    borderRadius: 15,
  },
  totalPostsIcon: {
    backgroundColor: "#f5a5236e",
    padding: 10,
    borderRadius: 15,
  },
  totalReelsIcon: {
    backgroundColor: "#ff47568c",
    padding: 10,
    borderRadius: 15,
  },
  totalCommentsIcon: {
    backgroundColor: "#7470af9a",
    padding: 10,
    borderRadius: 15,
  },
  totalLikesIcon: {
    backgroundColor: "#ed4c677b",
    padding: 10,
    borderRadius: 15,
  },
  totalReportsIcon: {
    backgroundColor: "#f7a11f75",
    padding: 10,
    borderRadius: 15,
  },
});
