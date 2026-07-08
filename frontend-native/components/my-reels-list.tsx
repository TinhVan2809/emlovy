import { Image } from "expo-image";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { AppColors, AppFonts } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { reelApi, resolveMediaUrl } from "@/services/api";
import type { Reel } from "@/types/auth";

type MyReelsListProps = {
  style?: StyleProp<ViewStyle>;
};

export function MyReelsList({ style }: MyReelsListProps) {
  const { token, user } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadMyReels = useCallback(async () => {
    if (!token || !user?.user_id) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await reelApi.getFeed({
        page: 1,
        limit: 6,
        token,
        userId: user.user_id,
      });

      setReels(response.data.items);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải danh sách reels của bạn.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, user?.user_id]);

  useEffect(() => {
    void loadMyReels();
  }, [loadMyReels]);

  if (isLoading && reels.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.title}>Reels của bạn</Text>
        <ActivityIndicator color={AppColors.accent} style={styles.loader} />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Reels của bạn</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {reels.length === 0 && !isLoading ? (
        <Text style={styles.emptyText}>Bạn chưa đăng reel nào.</Text>
      ) : null}

      <FlatList
        data={reels}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => String(item.post_id)}
        renderItem={({ item }) => {
          const thumbnailUri = resolveMediaUrl(
            item.media.find((media) => media.type === "image")?.media_url ||
              item.video_url ||
              item.video?.media_url,
          );

          return (
            <Pressable style={styles.card}>
              {thumbnailUri ? (
                <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} />
              ) : (
                <View style={[styles.thumbnail, styles.thumbnailFallback]}>
                  <Text style={styles.thumbnailFallbackText}>Reel</Text>
                </View>
              )}

              <Text numberOfLines={2} style={styles.cardTitle}>
                {item.content || "Reel mới"}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  title: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 16,
  },
  listContent: {
    gap: 12,
    paddingRight: 4,
  },
  card: {
    width: 120,
    gap: 8,
  },
  thumbnail: {
    width: 120,
    height: 160,
    borderRadius: 16,
    backgroundColor: AppColors.surfaceMuted,
  },
  thumbnailFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnailFallbackText: {
    color: AppColors.text,
    fontFamily: AppFonts.body,
  },
  cardTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.body,
    fontSize: 12,
  },
  loader: {
    marginVertical: 8,
  },
  emptyText: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 13,
  },
  errorText: {
    color: AppColors.accent,
    fontFamily: AppFonts.body,
    fontSize: 12,
  },
});
