import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppColors, AppFonts } from "@/constants/theme";
import {
  clearVideoCache,
  getVideoCacheStatistics,
} from "@/services/video-cache";

interface CacheStats {
  totalSizeMB: number;
  fileCount: number;
  oldestFileDate: Date;
  mostAccessedVideos: { url: string; accessCount: number }[];
}

export function VideoCacheSettings() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await getVideoCacheStatistics();
      setStats(data);
    } catch (error) {
      console.error("Failed to load cache stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleClearCache = () => {
    Alert.alert(
      "Xóa video cache",
      "Bạn có chắc muốn xóa tất cả video đã cache? Điều này sẽ giúp giải phóng bộ nhớ nhưng video sẽ phải tải lại.",
      [
        { style: "cancel", text: "Hủy" },
        {
          onPress: async () => {
            setIsClearing(true);
            try {
              await clearVideoCache();
              await loadStats();
              Alert.alert("Thành công", "Đã xóa toàn bộ video cache.");
            } catch (error) {
              Alert.alert(
                "Lỗi",
                "Không thể xóa cache. Vui lòng thử lại sau.",
              );
              console.log(error);
            } finally {
              setIsClearing(false);
            }
          },
          style: "destructive",
          text: "Xóa",
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={AppColors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons color={AppColors.accent} name="videocam" size={24} />
        <Text style={styles.headerTitle}>Video Cache</Text>
      </View>

      <Text style={styles.description}>
        Cache video giúp bạn xem lại các video đã xem mà không cần tải lại,
        tiết kiệm dữ liệu và tăng tốc độ phát.
      </Text>

      {stats ? (
        <View style={styles.statsContainer}>
          <StatRow
            icon="folder-outline"
            label="Tổng dung lượng"
            value={`${stats.totalSizeMB.toFixed(2)} MB`}
          />
          <StatRow
            icon="film-outline"
            label="Số video đã cache"
            value={String(stats.fileCount)}
          />
          <StatRow
            icon="time-outline"
            label="Video cũ nhất"
            value={formatDate(stats.oldestFileDate)}
          />
        </View>
      ) : null}

      <Pressable
        disabled={isClearing || !stats?.fileCount}
        onPress={handleClearCache}
        style={({ pressed }) => [
          styles.clearButton,
          pressed && styles.clearButtonPressed,
          (isClearing || !stats?.fileCount) && styles.clearButtonDisabled,
        ]}
      >
        {isClearing ? (
          <ActivityIndicator color={AppColors.surface} size="small" />
        ) : (
          <>
            <Ionicons color={AppColors.surface} name="trash-outline" size={18} />
            <Text style={styles.clearButtonText}>Xóa toàn bộ cache</Text>
          </>
        )}
      </Pressable>

      {stats && stats.mostAccessedVideos.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Video xem nhiều nhất</Text>
          {stats.mostAccessedVideos.map((video, index) => (
            <View key={index} style={styles.videoRow}>
              <Text numberOfLines={1} style={styles.videoUrl}>
                Video #{index + 1}
              </Text>
              <Text style={styles.accessCount}>
                {video.accessCount} lượt xem
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statRow}>
      <View style={styles.statLeft}>
        <Ionicons color={AppColors.muted} name={icon as any} size={20} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Hôm nay";
  }
  if (diffDays === 1) {
    return "Hôm qua";
  }
  if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  }

  return date.toLocaleDateString("vi-VN");
}

const styles = StyleSheet.create({
  accessCount: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 13,
  },
  clearButton: {
    alignItems: "center",
    backgroundColor: AppColors.accent,
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 24,
    minHeight: 48,
    paddingHorizontal: 20,
  },
  clearButtonDisabled: {
    opacity: 0.5,
  },
  clearButtonPressed: {
    opacity: 0.85,
  },
  clearButtonText: {
    color: AppColors.surface,
    fontFamily: AppFonts.heading,
    fontSize: 15,
  },
  container: {
    padding: 20,
  },
  description: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  headerTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 20,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 16,
    marginBottom: 12,
  },
  statLabel: {
    color: AppColors.text,
    fontFamily: AppFonts.body,
    fontSize: 15,
  },
  statLeft: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },
  statRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  statValue: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 15,
  },
  statsContainer: {
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  videoRow: {
    alignItems: "center",
    borderTopColor: AppColors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  videoUrl: {
    color: AppColors.text,
    flex: 1,
    fontFamily: AppFonts.body,
    fontSize: 14,
  },
});
