import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useIsFocused } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { useVideoPlayer, VideoView } from "expo-video";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from "react-native-reanimated";
import type { ComponentProps } from "react";
import type {
  GestureResponderEvent,
  LayoutChangeEvent,
  ViewToken,
} from "react-native";
import {
  ActivityIndicator,
  Alert,
  // FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  Image as Img
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { CommentsSheet } from "@/components/comments-sheet";
import { UserAvatar } from "@/components/user-avatar";
import { AppColors, AppFonts } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { reelApi, resolveMediaUrl } from "@/services/api";
import { subscribeToReelEvents } from "@/services/reel-socket";
import type {
  CreateReelInput,
  PostMediaInput,
  PostsPagination,
  Reel,
} from "@/types/auth";

const REELS_LIMIT = 6;
const REFRESH_CONTROL_COLORS = [AppColors.accent];
const VIDEO_FULLSCREEN_OPTIONS = { enable: true };

const mergeReels = (current: Reel[], incoming: Reel[]) => {
  const seen = new Set<number>();

  return [...current, ...incoming].filter((reel) => {
    if (seen.has(reel.post_id)) {
      return false;
    }

    seen.add(reel.post_id);
    return true;
  });
};

const formatCount = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  }

  return String(value);
};
const getReelThumbnailUrl = (reel: Reel) =>
  resolveMediaUrl(
    (reel as any).thumbnail_url ||
      reel.media.find((item) => item.type === "image")?.media_url,
  ) ?? undefined;

export default function ReelsScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const [containerHeight, setContainerHeight] = useState(windowHeight);
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { token, user } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const scrollY = useSharedValue(0);
  const onScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const [pagination, setPagination] = useState<PostsPagination | null>(null);
  const [activeReelId, setActiveReelId] = useState<number | null>(null);
  const [commentReelId, setCommentReelId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isComposerVisible, setIsComposerVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGlobalMuted, setIsGlobalMuted] = useState(false);
  const likingIdsRef = useRef<Set<number>>(new Set());

  // Sử dụng chiều cao đo được thực tế để tránh sai lệch Snap-to-interval
  const reelHeight = containerHeight;
  const selectedCommentReel = useMemo(
    () =>
      commentReelId
        ? reels.find((reel) => reel.post_id === commentReelId) || null
        : null,
    [commentReelId, reels],
  );

  // Tìm index của reel đang hoạt động để tính toán load lân cận
  const activeIndex = useMemo(
    () => reels.findIndex((r) => r.post_id === activeReelId),
    [activeReelId, reels],
  );

  const patchReel = useCallback((reelId: number, patch: Partial<Reel>) => {
    setReels((current) => {
      let didPatch = false;
      const next = current.map((reel) => {
        if (reel.post_id !== reelId) {
          return reel;
        }

        const hasChanges = Object.entries(patch).some(([key, value]) => {
          const currentValue = (reel as Record<string, unknown>)[key];
          return currentValue !== value;
        });

        if (!hasChanges) {
          return reel;
        }

        didPatch = true;
        return { ...reel, ...patch };
      });

      return didPatch ? next : current;
    });
  }, []);

  const loadReels = useCallback(
    async (page = 1, replace = true) => {
      if (replace) {
        setIsInitialLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await reelApi.getFeed({
          limit: REELS_LIMIT,
          page,
          token,
        });
        const nextItems = response.data.items;

        setPagination(response.data.pagination);
        setReels((current) =>
          replace ? nextItems : mergeReels(current, nextItems),
        );
        setActiveReelId((current) =>
          replace
            ? nextItems[0]?.post_id || null
            : current || nextItems[0]?.post_id || null,
        );
        setError("");
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Khong the tai reels.",
        );
      } finally {
        setIsInitialLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [token],
  );

  useEffect(() => {
    loadReels();
  }, [loadReels]);

  useEffect(() => {
    const unsubscribe = subscribeToReelEvents({
      onCreated: (reel) => {
        setReels((current) => mergeReels([reel], current));
      },
      onDeleted: ({ post_id }) => {
        setReels((current) => current.filter((r) => r.post_id !== post_id));
      },
      onLiked: (payload) => {
        if (!payload || typeof payload.post_id === 'undefined') return;
        patchReel(payload.post_id, {
          liked_by_me: payload.liked_by_me,
          like_count: payload.like_count,
        });
      },
      onCommented: (payload) => {
        if (!payload || typeof payload.post_id === 'undefined') return;
        patchReel(payload.post_id, { comment_count: payload.comment_count });
      },
    });

    return unsubscribe;
  }, [patchReel]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
    minimumViewTime: 150, // Chỉ xác nhận là "đang xem" nếu dừng lại ít nhất 150ms
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const nextVisible = viewableItems.find((item) => item.isViewable)
        ?.item as Reel | undefined;

      if (nextVisible) {
        setActiveReelId((current) =>
          current === nextVisible.post_id ? current : nextVisible.post_id,
        );
      }
    },
  ).current;

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadReels(1, true);
  }, [loadReels]);

  const handleLoadMore = useCallback(() => {
    if (!pagination?.hasMore || isLoadingMore || isInitialLoading) {
      return;
    }

    loadReels(pagination.page + 1, false);
  }, [isInitialLoading, isLoadingMore, loadReels, pagination]);

  const handleToggleLike = useCallback(
    async (reel: Reel) => {
      if (!token) {
        setError("Ban can dang nhap de thich reel.");
        return;
      }

      if (likingIdsRef.current.has(reel.post_id)) {
        return;
      }

      const likedByMe = !reel.liked_by_me;
      const likeCount = Math.max(0, reel.like_count + (likedByMe ? 1 : -1));

      likingIdsRef.current.add(reel.post_id);
      patchReel(reel.post_id, {
        liked_by_me: likedByMe,
        like_count: likeCount,
      });

      try {
        const response = await reelApi.toggleLike(token, reel.post_id);
        patchReel(reel.post_id, {
          liked_by_me: response.data.liked_by_me,
          like_count: response.data.like_count,
        });
        setError("");
      } catch (likeError) {
        patchReel(reel.post_id, {
          liked_by_me: reel.liked_by_me,
          like_count: reel.like_count,
        });
        setError(
          likeError instanceof Error
            ? likeError.message
            : "Khong the cap nhat luot thich.",
        );
      } finally {
        likingIdsRef.current.delete(reel.post_id);
      }
    },
    [token, patchReel],
  );

  const handleDelete = useCallback(
    (reel: Reel) => {
      if (!token) {
        setError("Ban can dang nhap de xoa reel.");
        return;
      }

      Alert.alert(
        "Delete reel",
        "Remove this reel from your profile and the feed?",
        [
          { style: "cancel", text: "Cancel" },
          {
            onPress: async () => {
              setReels((current) =>
                current.filter((item) => item.post_id !== reel.post_id),
              );

              try {
                await reelApi.delete(token, reel.post_id);
                setError("");
              } catch (deleteError) {
                setError(
                  deleteError instanceof Error
                    ? deleteError.message
                    : "Khong the xoa reel.",
                );
                loadReels(1, true);
              }
            },
            style: "destructive",
            text: "Delete",
          },
        ],
      );
    },
    [token, loadReels],
  );

  const handleCreateReel = useCallback(async (input: CreateReelInput) => {
    if (!token) {
      setError("Ban can dang nhap de dang reel.");
      return;
    }

    setIsUploading(true);

    try {
      const response = await reelApi.create(token, input);
      setReels((current) => mergeReels([response.data], current));
      setActiveReelId(response.data.post_id);
      setIsComposerVisible(false);
      setError("");
      loadReels(1, true);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Khong the dang reel.",
      );
    } finally {
      setIsUploading(false);
    }
  }, [loadReels, token]);

  const handleCommentCountChange = useCallback(
    (postId: number, commentCount: number) => {
      patchReel(postId, { comment_count: commentCount });
    },
    [patchReel],
  );

  // Mang activeIndex ra ngoài deps của useCallback tránh re-render toàn bộ list
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  const activeReelIdRef = useRef(activeReelId);
  // Đồng bộ ref ngay trong body để renderReel luôn thấy giá trị mới nhất khi FlatList gọi renderItem
  activeReelIdRef.current = activeReelId;

  const isMutedRef = useRef(isGlobalMuted);
  // isGlobalMuted vẫn là state để trigger re-render, nhưng ta dùng ref để renderReel không bị tạo lại
  isMutedRef.current = isGlobalMuted;

  // Tách ListEmptyComponent và ListFooterComponent ra ngoài bằng useMemo tránh tạo object mới sau mỗi lần render
  const listEmpty = useMemo(
    () =>
      isInitialLoading ? (
        <ActivityIndicator
          color={AppColors.surface}
          style={[styles.emptyState, { height: containerHeight }]}
        />
      ) : (
        <View style={[styles.emptyState, { height: containerHeight }]}>
          <Ionicons
            color="rgba(255,255,255,0.72)"
            name="film-outline"
            size={38}
          />
          <Text style={styles.emptyText}>No reels yet.</Text>
        </View>
      ),
    [isInitialLoading, containerHeight],
  );

  const listFooter = useMemo(
    () =>
      isLoadingMore ? (
        <ActivityIndicator
          color={AppColors.surface}
          style={styles.footerLoader}
        />
      ) : null,
    [isLoadingMore],
  );

  // extraData giúp FlatList biết khi nào cần yêu cầu renderReel tính toán lại prop cho các item
  const listExtraData = useMemo(
    () => ({ activeReelId, isGlobalMuted }),
    [activeReelId, isGlobalMuted],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      index,
      length: reelHeight,
      offset: reelHeight * index,
    }),
    [reelHeight],
  );

  const handleOpenComments = useCallback(
    (reel: Reel) => setCommentReelId(reel.post_id),
    [],
  );

  const handleToggleMute = useCallback(
    () => setIsGlobalMuted((prev) => !prev),
    [],
  );

  const renderReel = useCallback(
    ({ item, index }: { item: Reel; index: number }) => {
      // Tối ưu Preloading:
      // Load reel hiện tại, 1 reel phía trước (để vuốt ngược lại mượt)
      // và 2 reel tiếp theo (để vuốt xuống không phải chờ).
      const shouldLoad =
        index >= activeIndexRef.current - 1 &&
        index <= activeIndexRef.current + 2;

      return (
        <ReelCard
          currentUserId={user?.user_id}
          height={reelHeight}
          index={index}
          scrollY={scrollY}
          isActive={isFocused && activeReelIdRef.current === item.post_id}
          shouldLoad={shouldLoad}
          onDelete={handleDelete}
          onOpenComments={handleOpenComments}
          onToggleLike={handleToggleLike}
          isMuted={isMutedRef.current}
          onToggleMute={handleToggleMute}
          reel={item}
          tabBarHeight={tabBarHeight}
          thumbnailUri={getReelThumbnailUrl(item)}
        />
      );
    },
    [
      isFocused,
      reelHeight,
      tabBarHeight,
      user?.user_id,
      scrollY,
      handleDelete,
      handleToggleLike,
      handleOpenComments,
      handleToggleMute,
    ],
  );

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { height: layoutHeight } = e.nativeEvent.layout;
      if (layoutHeight > 0 && Math.abs(containerHeight - layoutHeight) > 1) {
        setContainerHeight(layoutHeight);
      }
    },
    [containerHeight],
  );

  const keyExtractor = useCallback((item: Reel) => String(item.post_id), []);
  const handleOpenComposer = useCallback(() => setIsComposerVisible(true), []);
  const handleCloseComposer = useCallback(() => setIsComposerVisible(false), []);
  const handleCloseComments = useCallback(() => setCommentReelId(null), []);
  const headerStyle = useMemo(
    () => [styles.header, { paddingTop: insets.top + 8 }],
    [insets.top],
  );
  const errorBannerStyle = useMemo(
    () => [styles.errorBanner, { top: insets.top + 58 }],
    [insets.top],
  );
  const refreshControl = useMemo(
    () => (
      <RefreshControl
        colors={REFRESH_CONTROL_COLORS}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        tintColor={AppColors.surface}
      />
    ),
    [handleRefresh, isRefreshing],
  );

  return (
    <View onLayout={handleLayout} style={styles.screen}>
      <StatusBar style="light" />

      {/* Đổ bóng gradient cố định giúp hiển thị Status Bar và Header rõ nét hơn */}
      <LinearGradient
        colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.3)", "transparent"]}
        locations={[0, 0.4, 1]}
        pointerEvents="none"
        style={styles.fixedTopShade}
      />

      <View
        pointerEvents="box-none"
        style={headerStyle}
      >
        <Text style={styles.headerTitle}>Reels</Text>
        <Pressable
          hitSlop={10}
          onPress={handleOpenComposer}
          style={styles.headerButton}
        >
          <Ionicons color={AppColors.surface} name="camera" size={22} />
        </Pressable>
      </View>

      {error ? (
        <View style={errorBannerStyle}>
          <Text numberOfLines={2} style={styles.errorText}>
            {error}
          </Text>
        </View>
      ) : null}

      <Animated.FlatList
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        data={reels}
        extraData={listExtraData}
        onScroll={onScrollHandler}
        scrollEventThrottle={16}
        windowSize={5} // Tăng nhẹ để giữ các player đã preload trong bộ nhớ
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        updateCellsBatchingPeriod={100}
        removeClippedSubviews={Platform.OS === "android"}
        disableIntervalMomentum={true}
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        keyExtractor={keyExtractor}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.7}
        onViewableItemsChanged={onViewableItemsChanged}
        pagingEnabled
        refreshControl={refreshControl}
        renderItem={renderReel}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never" // Ngăn chặn iOS tự động thêm padding cho an toàn
        snapToAlignment="start"
        snapToInterval={reelHeight}
        viewabilityConfig={viewabilityConfig}
      />

      <ReelComposerModal
        isSubmitting={isUploading}
        onClose={handleCloseComposer}
        onSubmit={handleCreateReel}
        visible={isComposerVisible}
      />

      <CommentsSheet
        kind="reel"
        onClose={handleCloseComments}
        onPostCommentCountChange={handleCommentCountChange}
        post={selectedCommentReel}
        token={token}
        visible={Boolean(selectedCommentReel)}
      />
    </View>
  );
}

const ReelCard = memo(
  ({
    currentUserId,
    isActive,
    shouldLoad,
    onDelete,
    onOpenComments,
    onToggleLike,
    isMuted,
    onToggleMute,
    reel,
    tabBarHeight,
    index,
    scrollY,
    thumbnailUri,
    height: cardHeight,
  }: {
    currentUserId?: number | null;
    isActive: boolean;
    shouldLoad: boolean;
    onDelete: (reel: Reel) => void;
    onOpenComments: (reel: Reel) => void;
    onToggleLike: (reel: Reel) => void;
    isMuted: boolean;
    onToggleMute: () => void;
    reel: Reel;
    tabBarHeight: number;
    index: number;
    scrollY: SharedValue<number>;
    height: number;
    thumbnailUri?: string;
  }) => {
    const videoUrl = useMemo(
      () => 
       resolveMediaUrl(
          reel.video_url ||
            reel.video?.media_url ||
            reel.media.find((item) => item.type === "video")?.media_url,
        ),
      [reel.media, reel.video?.media_url, reel.video_url],
    );
    const [showActions, setShowActions] = useState(false);
    const { authorName, authorHandle, avatarUrl, ownerCanDelete } = useMemo(
      () => ({
        authorName: reel.author?.name || "Emlovy User",
        authorHandle: reel.author?.username
          ? `@${reel.author.username}`
          : "@emlovy",
        avatarUrl: resolveMediaUrl(
          reel.author?.avatar_url || reel.author?.avata,
        ),
        ownerCanDelete: Number(currentUserId) === Number(reel.user_id),
      }),
      [reel, currentUserId],
    );

    // Hiệu ứng khi vuốt lên
    const animatedStyle = useAnimatedStyle(() => {
      const inputRange = [
        (index - 1) * cardHeight,
        index * cardHeight,
        (index + 1) * cardHeight,
      ];

      const scale = interpolate(
        scrollY.value,
        inputRange,
        [0.95, 1, 0.95],
        Extrapolation.CLAMP,
      );

      const opacity = interpolate(
        scrollY.value,
        inputRange,
        [0.6, 1, 0.6],
        Extrapolation.CLAMP,
      );

      return {
        transform: [{ scale }],
        opacity,
      };
    });

    const reelRef = useRef(reel);
    reelRef.current = reel; // sync trong body, luôn fresh

    const handleToggleLike = useCallback(
      () => onToggleLike(reelRef.current),
      [onToggleLike], 
    );

    const handleOpenComments = useCallback(
      () => onOpenComments(reelRef.current),
      [onOpenComments],
    );

    const handleDelete = useCallback(
      () => onDelete(reelRef.current),
      [onDelete],
    );

    const handleShowActions = useCallback(() => setShowActions(true), []);
    const handleCloseActions = useCallback(() => setShowActions(false), []);
    const handleDeleteAction = useCallback(() => {
      setShowActions(false);
      handleDelete();
    }, [handleDelete]);
    const reelPageHeightStyle = useMemo(
      () => ({ height: cardHeight }),
      [cardHeight],
    );
    const sideRailStyle = useMemo(
      () => [styles.sideRail, { bottom: tabBarHeight + 25 }],
      [tabBarHeight],
    );
    const reelInfoStyle = useMemo(
      () => [styles.reelInfo, { bottom: tabBarHeight + 12 }],
      [tabBarHeight],
    );

    return (
      <Animated.View
        style={[styles.reelPage, reelPageHeightStyle, animatedStyle]}
      >
        {videoUrl && shouldLoad ? (
          <ReelVideo
            isActive={isActive}
            isMuted={isMuted}
            tabBarHeight={tabBarHeight}
            uri={videoUrl!}
            thumbnailUri={thumbnailUri}
          />
        ) : (
          <View style={styles.videoFallback}>
            <Ionicons
              color="rgba(255,255,255,0.76)"
              name="videocam-off-outline"
              size={36}
            />
          </View>
        )}

        <View style={sideRailStyle}>
          <RailButton
            active={reel.liked_by_me}
            icon={reel.liked_by_me ? "heart" : "heart-outline"}
            label={formatCount(reel.like_count)}
            onPress={handleToggleLike}
          />
          <RailButton
            icon="chatbubble-outline"
            label={formatCount(reel.comment_count)}
            onPress={handleOpenComments}
          />
          {/* More options */}
          <RailButton
            icon="ellipsis-horizontal"
            label=""
            onPress={handleShowActions}
          />
          {/* Bật/tắt âm thanh */}
          <Pressable onPress={onToggleMute} hitSlop={10}>
            <Ionicons
              color={AppColors.surface}
              name={isMuted ? "volume-mute" : "volume-high"}
              size={22}
            />
          </Pressable>
        </View>

        {/* Tên và content của ggười đăng */}
        <View style={reelInfoStyle}>
          <View style={styles.authorRow}>
            <UserAvatar imageUrl={avatarUrl} name={authorName} size={42} />
            <View style={styles.authorMeta}>
              <View style={styles.authorContainer}>
                <View style={styles.isVerified}>
                  <Text numberOfLines={1} style={styles.authorName}>
                    {authorName}
                  </Text>
                  {reel.author?.is_verified === 1 ? (
                  <Img source={require("../../assets/images/verifed.png")} style={styles.verifiedIcon} />
                  ) : null}
                </View>
                <Pressable style={styles.followBox}>
                  <Text style={styles.followText}>Follow</Text>
                </Pressable>
              </View>
              <Text numberOfLines={1} style={styles.authorHandle}>
                {authorHandle}
              </Text>
            </View>
          </View>

          {reel.content ? (
            <Text numberOfLines={3} style={styles.caption}>
              {reel.content}
            </Text>
          ) : null}
        </View>

        <Modal animationType="fade" transparent visible={showActions}>
          <Pressable
            style={styles.actionModalBackdrop}
            onPress={handleCloseActions}
          >
            <View style={styles.actionMenu}>
              <Pressable
                style={styles.actionItem}
                onPress={() => {
                  setShowActions(false); /* Logic lưu Reel */
                }}
              >
                <Text style={styles.actionItemText}>Lưu Reel</Text>
              </Pressable>
              <Pressable
                style={styles.actionItem}
                onPress={handleCloseActions}
              >
                <Text style={styles.actionItemText}>Sao chép liên kết</Text>
              </Pressable>
              <Pressable
                style={styles.actionItem}
                onPress={handleCloseActions}
              >
                <Text style={styles.actionItemText}>Chia sẻ</Text>
              </Pressable>
              <Pressable
                style={styles.actionItem}
                onPress={() => {
                  setShowActions(false); /* Logic báo cáo */
                }}
              >
                <Text style={[styles.actionItemText, styles.destructiveText]}>
                  Báo cáo
                </Text>
              </Pressable>
              {ownerCanDelete ? (
                <Pressable style={styles.actionItem} onPress={handleDeleteAction}>
                  <Text style={[styles.actionItemText, styles.destructiveText]}>
                    Xóa
                  </Text>
                </Pressable>
              ) : null}
              <Pressable
                style={styles.actionItemLast}
                onPress={handleCloseActions}
              >
                <Text style={[styles.actionItemText]}>Hủy</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </Animated.View>
    );
  },
  (prev, next) => {
    // true = KHÔNG re-render, false = re-render
    return (
      prev.isActive === next.isActive &&
      prev.shouldLoad === next.shouldLoad &&
      prev.isMuted === next.isMuted &&
      prev.height === next.height &&
      prev.tabBarHeight === next.tabBarHeight &&
      prev.index === next.index &&
      prev.thumbnailUri === next.thumbnailUri &&
      prev.currentUserId === next.currentUserId &&
      prev.onDelete === next.onDelete &&
      prev.onOpenComments === next.onOpenComments &&
      prev.onToggleLike === next.onToggleLike &&
      prev.onToggleMute === next.onToggleMute &&
      // So sánh reel theo từng field quan trọng, KHÔNG so sánh cả object
      prev.reel.post_id === next.reel.post_id &&
      prev.reel.liked_by_me === next.reel.liked_by_me &&
      prev.reel.like_count === next.reel.like_count &&
      prev.reel.comment_count === next.reel.comment_count &&
      prev.reel.content === next.reel.content &&
      prev.reel.user_id === next.reel.user_id &&
      prev.reel.author === next.reel.author &&
      prev.reel.media === next.reel.media &&
      prev.reel.video_url === next.reel.video_url &&
      prev.reel.video?.media_url === next.reel.video?.media_url
      // scrollY là SharedValue (ref-stable) nên không cần so sánh
      // → không so sánh, chấp nhận dùng version mới nhất
    );
  },
);

ReelCard.displayName = "ReelCard";

const ReelVideo = memo(function ReelVideo({
  isActive,
  uri,
  isMuted,
  tabBarHeight,
  thumbnailUri,
}: {
  isActive: boolean;
  uri: string;
  isMuted: boolean;
  tabBarHeight: number;
  thumbnailUri?: string;
}) {
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isReadyToPlay, setIsReadyToPlay] = useState(false);
  const progress = useSharedValue(0);
  const containerWidth = useRef(0);

  const player = useVideoPlayer(uri, (nextPlayer) => {
    nextPlayer.loop = true;
    nextPlayer.muted = isMuted;
  });

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));
  const progressBarContainerStyle = useMemo(
    () => [styles.progressBarContainer, { bottom: tabBarHeight }],
    [tabBarHeight],
  );
  const thumbnailSource = useMemo(
    () => (thumbnailUri ? { uri: thumbnailUri } : undefined),
    [thumbnailUri],
  );
  const handleProgressLayout = useCallback((event: LayoutChangeEvent) => {
    containerWidth.current = event.nativeEvent.layout.width;
  }, []);

  const handleSeek = useCallback((event: GestureResponderEvent) => {
    const touchX = event.nativeEvent.locationX;
    if (containerWidth.current > 0 && player.duration > 0) {
      const seekPercentage = Math.max(
        0,
        Math.min(1, touchX / containerWidth.current),
      );
      player.currentTime = seekPercentage * player.duration;
      progress.value = seekPercentage;
    }
  }, [player, progress]);

  // Theo dõi tiến trình video
  useEffect(() => {
    if (!isActive) {
      progress.value = 0;
      return;
    }

    const interval = setInterval(() => {
      if (player.duration > 0) {
        progress.value = player.currentTime / player.duration;
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isActive, player, progress]);

  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted, player]);

  useEffect(() => {
    setIsBuffering(false);
    setIsReadyToPlay(false);
    setIsManuallyPaused(false);
    progress.value = 0;
  }, [progress, uri]);

  useEffect(() => {
    const sub = player.addListener("statusChange", ({ status }) => {
      const nextIsBuffering = status === "loading";
      setIsBuffering((current) =>
        current === nextIsBuffering ? current : nextIsBuffering,
      );
      if (status === "readyToPlay") {
        setIsReadyToPlay((current) => (current ? current : true));
      }
    });
    return () => sub.remove();
  }, [player]);

  useEffect(() => {
    if (!isActive) {
      player.pause();
      setIsManuallyPaused(false);
      return;
    }

    if (isManuallyPaused) {
      player.pause();
    } else {
      player.play();
    }
  }, [isActive, isManuallyPaused, player]);

  const handleTogglePlayback = useCallback(() => {
    if (!isActive) {
      return;
    }

    setIsManuallyPaused((value) => !value);
  }, [isActive]);

  return (
    <Pressable onPress={handleTogglePlayback} style={styles.videoSurface}>
      <VideoView
        fullscreenOptions={VIDEO_FULLSCREEN_OPTIONS}
        contentFit="contain"
        nativeControls={false}
        player={player}
        style={StyleSheet.absoluteFill}
      />

      {thumbnailSource && !isReadyToPlay && (
        <Image
          source={thumbnailSource}
          style={StyleSheet.absoluteFill}
          contentFit="contain"
          transition={200}
        />
      )}

      {/* Thanh tiến trình (Progress Bar) */}
      <Pressable
        onLayout={handleProgressLayout}
        onPress={handleSeek}
        style={progressBarContainerStyle}
      >
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBar, progressBarStyle]} />
        </View>
      </Pressable>

      {isBuffering && isActive && !isManuallyPaused ? (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <ActivityIndicator color="rgba(255,255,255,0.6)" size="small" />
        </View>
      ) : null}
      {isActive && isManuallyPaused ? (
        <View pointerEvents="none" style={styles.pauseBadge}>
          <Ionicons color={AppColors.surface} name="play" size={26} />
        </View>
      ) : null}
    </Pressable>
  );
});

ReelVideo.displayName = "ReelVideo";

const RailButton = memo(function RailButton({
  active = false,
  destructive = false,
  icon,
  label,
  onPress,
}: {
  active?: boolean;
  destructive?: boolean;
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
}) {
  const color = destructive
    ? "#FF6F61"
    : active
      ? AppColors.accent
      : AppColors.surface;

  return (
    <Pressable hitSlop={10} onPress={onPress} style={styles.railButton}>
      <View style={styles.railIconShell}>
        <Ionicons color={color} name={icon} size={26} />
      </View>
      <Text numberOfLines={1} style={styles.railText}>
        {label}
      </Text>
    </Pressable>
  );
});

RailButton.displayName = "RailButton";

function ReelComposerModal({
  isSubmitting,
  onClose,
  onSubmit,
  visible,
}: {
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (input: CreateReelInput) => Promise<void>;
  visible: boolean;
}) {
  const insets = useSafeAreaInsets();
  const [caption, setCaption] = useState("");
  const [video, setVideo] = useState<PostMediaInput | null>(null);
  const [error, setError] = useState("");
  const canSubmit = Boolean(video) && !isSubmitting;

  useEffect(() => {
    if (!visible) {
      setCaption("");
      setVideo(null);
      setError("");
    }
  }, [visible]);

  const pickVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError("Ung dung can quyen truy cap thu vien video.");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        allowsMultipleSelection: false,
        mediaTypes: ["videos"] as ImagePicker.MediaType[],
        quality: 1,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      setVideo({
        fileName: asset.fileName,
        mimeType: asset.mimeType || "video/mp4",
        uri: asset.uri,
      });
      setError("");
    } catch (pickError) {
      setError(
        pickError instanceof Error
          ? pickError.message
          : "Khong the chon video.",
      );
    }
  };

  const submit = async () => {
    if (!video) {
      setError("Hay chon mot video.");
      return;
    }

    await onSubmit({
      caption: caption.trim() || null,
      video,
    });
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", default: undefined })}
        style={styles.composerBackdrop}
      >
        <SafeAreaView edges={["top"]} style={styles.composerSheet}>
          <View style={styles.composerHeader}>
            <Pressable
              disabled={isSubmitting}
              hitSlop={10}
              onPress={onClose}
              style={styles.composerIconButton}
            >
              <Ionicons color={AppColors.text} name="close" size={24} />
            </Pressable>
            <Text style={styles.composerTitle}>New reel</Text>
            <Pressable
              disabled={!canSubmit}
              hitSlop={10}
              onPress={submit}
              style={styles.composerPostButton}
            >
              {isSubmitting ? (
                <ActivityIndicator color={AppColors.accent} size="small" />
              ) : (
                <Text
                  style={[
                    styles.composerPostText,
                    !canSubmit ? styles.disabledText : null,
                  ]}
                >
                  Post
                </Text>
              )}
            </Pressable>
          </View>

          <View
            style={[
              styles.composerContent,
              { paddingBottom: Math.max(insets.bottom, 18) },
            ]}
          >
            <Pressable
              disabled={isSubmitting}
              onPress={pickVideo}
              style={styles.videoPicker}
            >
              {video ? (
                <PreviewVideo uri={video.uri} />
              ) : (
                <View style={styles.videoPickerEmpty}>
                  <Ionicons
                    color={AppColors.muted}
                    name="cloud-upload-outline"
                    size={32}
                  />
                  <Text style={styles.videoPickerText}>Tải video lên</Text>
                </View>
              )}
            </Pressable>

            <TextInput
              maxLength={2200}
              multiline
              onChangeText={setCaption}
              placeholder="Write a caption..."
              placeholderTextColor={AppColors.tabInactive}
              style={styles.captionInput}
              value={caption}
            />

            {error ? <Text style={styles.composerError}>{error}</Text> : null}

            <Pressable
              disabled={!canSubmit}
              onPress={submit}
              style={[
                styles.primaryButton,
                !canSubmit ? styles.primaryButtonDisabled : null,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={AppColors.surface} />
              ) : (
                <>
                  <Ionicons
                    color={AppColors.surface}
                    name="arrow-up-circle"
                    size={19}
                  />
                  <Text style={styles.primaryButtonText}>Upload reel</Text>
                </>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function PreviewVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (nextPlayer) => {
    nextPlayer.loop = true;
    nextPlayer.muted = true;
    nextPlayer.play();
  });

  return (
    <VideoView
      contentFit="cover"
      nativeControls={false}
      player={player}
      style={StyleSheet.absoluteFill}
    />
  );
}

const styles = StyleSheet.create({
  authorHandle: {
    color: "rgba(255,255,255,0.72)",
    fontFamily: AppFonts.body,
    fontSize: 12,
  },
  authorMeta: {
    flex: 1,
    gap: 2,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  isVerified: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  followBox: {
    borderWidth: 1,
    borderColor: "#fff",
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  followText: {
    color: "#fff",
    fontSize: 12,
  },
  authorName: {
    color: AppColors.surface,
    fontFamily: AppFonts.heading,
    fontSize: 15,
  },
  verifiedIcon: {
    width: 16,
    height: 16,
  },
  isVerifiedIcon: {
    color: "#fff",
    backgroundColor: AppColors.checkmark,
    padding: 1,
    borderRadius: 100,
  },
  authorRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  caption: {
    color: AppColors.surface,
    fontFamily: AppFonts.body,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: "88%",
    paddingTop: 12,
  },
  captionInput: {
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: AppColors.text,
    fontFamily: AppFonts.body,
    fontSize: 15,
    minHeight: 94,
    padding: 12,
    textAlignVertical: "top",
  },
  composerBackdrop: {
    backgroundColor: "rgba(0,0,0,0.45)",
    flex: 1,
    justifyContent: "flex-end",
  },
  composerContent: {
    gap: 14,
    padding: 16,
  },
  composerError: {
    color: AppColors.accent,
    fontFamily: AppFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  composerHeader: {
    alignItems: "center",
    borderBottomColor: AppColors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 58,
    paddingHorizontal: 12,
  },
  composerIconButton: {
    alignItems: "center",
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  composerPostButton: {
    alignItems: "center",
    height: 42,
    justifyContent: "center",
    minWidth: 52,
  },
  composerPostText: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 15,
  },
  composerSheet: {
    backgroundColor: AppColors.surface,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    maxHeight: "94%",
    overflow: "hidden",
  },
  composerTitle: {
    color: AppColors.text,
    flex: 1,
    fontFamily: AppFonts.heading,
    fontSize: 17,
    textAlign: "center",
  },
  disabledText: {
    opacity: 0.45,
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
  },
  emptyText: {
    color: "rgba(255,255,255,0.76)",
    fontFamily: AppFonts.heading,
    fontSize: 15,
  },
  errorBanner: {
    alignSelf: "center",
    backgroundColor: "rgba(242,95,76,0.92)",
    borderRadius: 8,
    left: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: "absolute",
    right: 18,
    zIndex: 20,
  },
  errorText: {
    color: AppColors.surface,
    fontFamily: AppFonts.heading,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  footerLoader: {
    backgroundColor: "#050505",
    paddingVertical: 20,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    left: 0,
    paddingHorizontal: 16,
    paddingBottom: 10,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 10,
  },
  headerButton: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.28)",
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  headerTitle: {
    color: AppColors.surface,
    fontFamily: AppFonts.heading,
    fontSize: 23,
  },
  pauseBadge: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.42)",
    borderRadius: 34,
    height: 68,
    justifyContent: "center",
    left: "50%",
    marginLeft: -34,
    marginTop: -34,
    position: "absolute",
    top: "50%",
    width: 68,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: AppColors.text,
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 52,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: AppColors.surface,
    fontFamily: AppFonts.heading,
    fontSize: 15,
  },
  railButton: {
    alignItems: "center",
    gap: 5,
    minWidth: 58,
  },
  railIconShell: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.28)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  railText: {
    color: AppColors.surface,
    fontFamily: AppFonts.heading,
    fontSize: 11,
    maxWidth: 62,
  },
  reelInfo: {
    bottom: 28,
    left: 16,
    position: "absolute",
    right: 86,
  },
  reelPage: {
    backgroundColor: "#050505",
    overflow: "hidden",
    position: "relative",
  },
  screen: {
    backgroundColor: "#050505",
    flex: 1,
  },
  sideRail: {
    alignItems: "center",
    bottom: 34,
    gap: 18,
    position: "absolute",
    right: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  fixedTopShade: {
    // Đổ bóng gradient hoặc đặc hơn một chút ở vùng Dynamic Island
    // backgroundColor: "rgba(0,0,0,0.3)",
    height: 140,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 9, // Nằm dưới Header (zIndex 10) nhưng trên FlatList
  },
  videoFallback: {
    alignItems: "center",
    backgroundColor: "#151515",
    flex: 1,
    justifyContent: "center",
  },
  videoPicker: {
    alignSelf: "center",
    aspectRatio: 9 / 14,
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: 420,
    minHeight: 300,
    overflow: "hidden",
    width: "72%",
  },
  videoPickerEmpty: {
    alignItems: "center",
    flex: 1,
    gap: 9,
    justifyContent: "center",
  },
  videoPickerText: {
    color: AppColors.muted,
    fontFamily: AppFonts.heading,
    fontSize: 14,
  },
  videoSurface: {
    backgroundColor: "#050505",
    flex: 1,
  },
  actionModalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    flex: 1,
    justifyContent: "center",
  },
  actionMenu: {
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    overflow: "hidden",
    width: "75%",
  },
  actionItem: {
    alignItems: "center",
    borderBottomColor: AppColors.border,
    borderBottomWidth: 1,
    paddingVertical: 16,
  },
  actionItemLast: {
    alignItems: "center",
    paddingVertical: 16,
  },
  actionItemText: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 16,
  },
  destructiveText: {
    color: AppColors.accent,
  },
  progressBarContainer: {
    bottom: 0,
    height: 30, // Vùng chạm rộng hơn để dễ thao tác
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 10,
    justifyContent: "flex-end",
  },
  progressBarTrack: {
    backgroundColor: "rgba(255, 255, 255, 0.24)",
    height: 2,
    width: "100%",
  },
  progressBar: {
    backgroundColor: AppColors.surface,
    height: "100%",
  },
});
