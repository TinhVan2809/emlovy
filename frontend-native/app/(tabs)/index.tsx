import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { Routes } from "@/constants/routes";
import { useStatusBarStyle } from "@/hooks/useStatusBarStyle";
import { useUnreadMessages } from "@/contexts/unread-messages-context";
import { ChatNotificationBadge } from "@/components/chat-notification-badge";
import { CommentsSheet } from "@/components/comments-sheet";
import PostCard from "@/components/post-card";
import { PostComposerModal } from "@/components/post-composer-modal";
import { ScreenShell } from "@/components/screen-shell";
import { StoryComposerModal } from "@/components/story-composer-modal";
import { StoryTray } from "@/components/story-tray";
import { stories as fallbackStories } from "@/constants/mock-content";
import { AppColors, AppFonts } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { postApi, storyApi } from "@/services/api";
import { subscribeToPostEvents } from "@/services/post-socket";
import { subscribeToStoryEvents } from "@/services/story-socket";
import type {
  CreateStoryInput,
  Post,
  PostsPagination,
  StoryGroup,
  UpdatePostInput,
} from "@/types/auth";
import Footer from "@/components/footer";

const FEED_LIMIT = 10;
const FEED_FILTERS = ["Dành cho bạn", "Following", "Fresh drops", "Saved"];

const mergePosts = (current: Post[], incoming: Post[]) => {
  const seen = new Set<number>();

  return [...current, ...incoming].filter((post) => {
    if (seen.has(post.post_id)) {
      return false;
    }

    seen.add(post.post_id);
    return true;
  });
};

export default function HomeScreen() {
  const { token, user } = useAuth();
  const { unreadCount } = useUnreadMessages();
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PostsPagination | null>(null);
  const [error, setError] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [commentPostId, setCommentPostId] = useState<number | null>(null);
  const likingPostIdsRef = useRef<Set<number>>(new Set());
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [storyError, setStoryError] = useState("");
  const [storyComposerVisible, setStoryComposerVisible] = useState(false);
  const [isSubmittingStory, setIsSubmittingStory] = useState(false);

  useStatusBarStyle("light");

  const loadStories = useCallback(async () => {
    if (!token) {
      setStoryGroups([]);
      setStoryError("");
      return;
    }

    try {
      const response = await storyApi.getFollowing(token);
      setStoryGroups(response.data.groups);
      setStoryError("");
    } catch (loadError) {
      setStoryError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải stories.",
      );
    }
  }, [token]);

  const loadFeed = useCallback(
    async (page = 1, replace = true) => {
      if (replace) {
        setIsInitialLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await postApi.getFeed({
          limit: FEED_LIMIT,
          page,
          token,
        });
        setPagination(response.data.pagination);
        setPosts((current) =>
          replace
            ? response.data.items
            : mergePosts(current, response.data.items),
        );
        setError("");
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Không thể tải feed.",
        );
      } finally {
        setIsInitialLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    loadFeed();
    loadStories();
  }, [loadFeed, loadStories]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const reloadStories = () => {
      loadStories();
    };

    return subscribeToStoryEvents({
      onCreated: reloadStories,
      onDeleted: reloadStories,
      onExpired: reloadStories,
      onUpdated: reloadStories,
    });
  }, [loadStories, token]);

  useEffect(
    () =>
      subscribeToPostEvents({
        onCreated: (post) => {
          setPosts((current) => {
            if (post.visibility !== "public") {
              return current;
            }

            if (current.some((item) => item.post_id === post.post_id)) {
              return current;
            }

            return [post, ...current];
          });
        },
        onCommented: ({ post_id, comment_count }) => {
          setPosts((current) => {
            let didPatch = false;
            const next = current.map((post) => {
              if (
                post.post_id !== post_id ||
                post.comment_count === comment_count
              ) {
                return post;
              }

              didPatch = true;
              return { ...post, comment_count };
            });

            return didPatch ? next : current;
          });
        },
        onDeleted: ({ post_id }) => {
          setPosts((current) =>
            current.filter((post) => post.post_id !== post_id),
          );
        },
        onHidden: ({ post_id }) => {
          setPosts((current) =>
            current.filter((post) => post.post_id !== post_id),
          );
        },
        onUpdated: (post) => {
          setPosts((current) => {
            if (post.visibility !== "public") {
              return current.filter((item) => item.post_id !== post.post_id);
            }

            return current.map((item) =>
              item.post_id === post.post_id
                ? { ...post, liked_by_me: item.liked_by_me }
                : item,
            );
          });
        },
      }),
    [],
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadStories();
    loadFeed(1, true);
  }, [loadFeed, loadStories]);

  const handleLoadMore = useCallback(() => {
    if (!pagination?.hasMore || isLoadingMore || isInitialLoading) {
      return;
    }

    loadFeed(pagination.page + 1, false);
  }, [
    isInitialLoading,
    isLoadingMore,
    loadFeed,
    pagination?.hasMore,
    pagination?.page,
  ]);

  const handleDeletePost = useCallback(
    async (post: Post) => {
      if (!token) {
        setError("Bạn cần đăng nhập để xóa bài viết.");
        return;
      }

      setPosts((current) =>
        current.filter((item) => item.post_id !== post.post_id),
      );

      try {
        await postApi.delete(token, post.post_id);
      } catch (deleteError) {
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : "Xóa bài viết thành công.",
        );
        loadFeed(1, true);
      }
    },
    [loadFeed, token],
  );

  const handleSubmitEdit = useCallback(
    async (input: UpdatePostInput) => {
      if (!token || !editingPost) {
        return;
      }

      setIsSubmittingEdit(true);

      try {
        const response = await postApi.update(
          token,
          editingPost.post_id,
          input,
        );
        setPosts((current) =>
          current.map((post) =>
            post.post_id === response.data.post_id ? response.data : post,
          ),
        );
        setEditingPost(null);
      } catch (editError) {
        setError(
          editError instanceof Error
            ? editError.message
            : "Cập nhật bài viết không thành công.",
        );
      } finally {
        setIsSubmittingEdit(false);
      }
    },
    [editingPost, token],
  );

  const selectedCommentPost = useMemo(
    () =>
      commentPostId
        ? posts.find((post) => post.post_id === commentPostId) || null
        : null,
    [commentPostId, posts],
  );

  const patchPost = useCallback((postId: number, patch: Partial<Post>) => {
    setPosts((current) =>
      current.map((post) =>
        post.post_id === postId ? { ...post, ...patch } : post,
      ),
    );
  }, []);

  const handleTogglePostLike = useCallback(
    async (post: Post) => {
      if (!token) {
        setError("Bạn cần đăng nhập.");
        return;
      }

      if (likingPostIdsRef.current.has(post.post_id)) {
        return;
      }

      const shouldLike = !post.liked_by_me;
      const optimisticLikeCount = Math.max(
        0,
        post.like_count + (shouldLike ? 1 : -1),
      );

      likingPostIdsRef.current.add(post.post_id);
      patchPost(post.post_id, {
        liked_by_me: shouldLike,
        like_count: optimisticLikeCount,
      });

      try {
        const response = shouldLike
          ? await postApi.like(token, post.post_id)
          : await postApi.unlike(token, post.post_id);

        patchPost(post.post_id, {
          liked_by_me: response.data.liked_by_me,
          like_count: response.data.like_count,
        });
        setError("");
      } catch (likeError) {
        patchPost(post.post_id, {
          liked_by_me: post.liked_by_me,
          like_count: post.like_count,
        });
        setError(
          likeError instanceof Error
            ? likeError.message
            : "Không thể cập nhật tym bài viết.",
        );
      } finally {
        likingPostIdsRef.current.delete(post.post_id);
      }
    },
    [patchPost, token],
  );

  const handlePostCommentCountChange = useCallback(
    (postId: number, commentCount: number) => {
      patchPost(postId, { comment_count: commentCount });
    },
    [patchPost],
  );

  // Đồng bộ userId vào ref để các callback không bị tạo lại khi user login/logout hoặc cập nhật profile
  const userIdRef = useRef(user?.user_id);
  userIdRef.current = user?.user_id;

  const handleOpenAuthor = useCallback((post: Post) => {
    if (Number(post.user_id) === Number(userIdRef.current)) {
      router.push(Routes.profile);
      return;
    }

    router.push({
      pathname: "/(users)/[userId]",
      params: { userId: String(post.user_id) },
    });
  }, []);

  const handleSubmitStory = useCallback(
    async (input: CreateStoryInput) => {
      if (!token) {
        setStoryError("Bạn cần đăng nhập để tạo story.");
        return;
      }

      setIsSubmittingStory(true);

      try {
        await storyApi.create(token, input);
        setStoryComposerVisible(false);
        await loadStories();
      } catch (submitError) {
        setStoryError(
          submitError instanceof Error
            ? submitError.message
            : "Không thể tạo story.",
        );
      } finally {
        setIsSubmittingStory(false);
      }
    },
    [loadStories, token],
  );

  const handleOpenStoryComposer = useCallback(() => {
    setStoryComposerVisible(true);
  }, []);

  const handleOpenComments = useCallback((post: Post) => {
    setCommentPostId(post.post_id);
  }, []);

  const handleCloseComments = useCallback(() => {
    setCommentPostId(null);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setEditingPost(null);
  }, []);

  const keyExtractor = useCallback((item: Post) => String(item.post_id), []);

  const renderPostItem = useCallback(
    ({ item }: { item: Post }) => (
      <FeedPostItem
        currentUserId={userIdRef.current}
        onDelete={handleDeletePost}
        onEdit={setEditingPost}
        onOpenAuthor={handleOpenAuthor}
        onOpenComments={handleOpenComments}
        onToggleLike={handleTogglePostLike}
        post={item}
      />
    ),
    [
      handleDeletePost,
      handleOpenAuthor,
      handleOpenComments,
      handleTogglePostLike,
    ],
  );

  // extraData giúp FlatList biết khi nào cần yêu cầu renderPostItem tính toán lại prop cho các item
  const listExtraData = useMemo(
    () => ({ userId: user?.user_id }),
    [user?.user_id],
  );

  const listHeader = useMemo(
    () => (
      <FeedHeader
        count={pagination?.total || posts.length}
        error={error}
        onCreateStory={handleOpenStoryComposer}
        storyError={storyError}
        storyGroups={storyGroups}
      />
    ),
    [
      error,
      handleOpenStoryComposer,
      pagination?.total,
      posts.length,
      storyError,
      storyGroups,
    ],
  );

  const listEmpty = useMemo(
    () =>
      isInitialLoading ? (
        <ActivityIndicator color={AppColors.accent} style={styles.emptyState} />
      ) : (
        <Text style={styles.emptyText}>Chưa có vài viết nào.</Text>
      ),
    [isInitialLoading],
  );

  const listFooter = useMemo(
    () => (
      <View>
        {isLoadingMore ? (
          <ActivityIndicator
            color={AppColors.accent}
            style={styles.footerLoader}
          />
        ) : null}
        <Footer />
      </View>
    ),
    [isLoadingMore],
  );

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        colors={[AppColors.accent]}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        tintColor={AppColors.accent}
      />
    ),
    [handleRefresh, isRefreshing],
  );

  return (
    <ScreenShell
      titleNode={<Text style={styles.brand}>emlovy</Text>}
      right={
        <View style={styles.headerActions}>
          <Ionicons color={AppColors.text} name="heart-outline" size={24} />
          <Pressable hitSlop={8} onPress={() => router.push(Routes.chat)}>
            <View>
              <Ionicons
                color={AppColors.text}
                name="paper-plane-outline"
                size={24}
              />
              <ChatNotificationBadge count={unreadCount} size="medium" />
            </View>
          </Pressable>
        </View>
      }
    >
      <FlatList
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.content}
        data={posts}
        extraData={listExtraData}
        initialNumToRender={4}
        keyExtractor={keyExtractor}
        maxToRenderPerBatch={4}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.55}
        refreshControl={refreshControl}
        renderItem={renderPostItem}
        removeClippedSubviews={Platform.OS === "android"}
        showsVerticalScrollIndicator={false}
        updateCellsBatchingPeriod={60}
        windowSize={7}
      />

      <PostComposerModal
        initialPost={editingPost}
        isSubmitting={isSubmittingEdit}
        mode="edit"
        onClose={handleCloseEdit}
        onSubmit={(input) => handleSubmitEdit(input as UpdatePostInput)}
        visible={Boolean(editingPost)}
      />

      <CommentsSheet
        onClose={handleCloseComments}
        onPostCommentCountChange={handlePostCommentCountChange}
        post={selectedCommentPost}
        token={token}
        visible={Boolean(selectedCommentPost)}
      />

      <StoryComposerModal
        isSubmitting={isSubmittingStory}
        mode="create"
        onClose={() => setStoryComposerVisible(false)}
        onSubmit={(input) => handleSubmitStory(input as CreateStoryInput)}
        visible={storyComposerVisible}
      />
    </ScreenShell>
  );
}

const FeedPostItem = memo(function FeedPostItem({
  currentUserId,
  onDelete,
  onEdit,
  onOpenAuthor,
  onOpenComments,
  onToggleLike,
  post,
}: {
  currentUserId?: number | null;
  onDelete: (post: Post) => void;
  onEdit: (post: Post) => void;
  onOpenAuthor: (post: Post) => void;
  onOpenComments: (post: Post) => void;
  onToggleLike: (post: Post) => void;
  post: Post;
}) {
  return (
    <View style={styles.feedItem}>
      <PostCard
        currentUserId={currentUserId}
        onDelete={onDelete}
        onEdit={onEdit}
        onOpenAuthor={onOpenAuthor}
        onOpenComments={onOpenComments}
        onToggleLike={onToggleLike}
        post={post}
      />
    </View>
  );
});

FeedPostItem.displayName = "FeedPostItem";

const FeedHeader = memo(function FeedHeader({
  count,
  error,
  onCreateStory,
  storyError,
  storyGroups,
}: {
  count: number;
  error: string;
  onCreateStory: () => void;
  storyError: string;
  storyGroups: StoryGroup[];
}) {
  return (
    <View style={styles.headerContent}>
      <View style={styles.storySection}>
        <StoryTray
          fallbackStories={fallbackStories}
          groups={storyGroups}
          onCreateStory={onCreateStory}
        />
        {storyError ? (
          <Text style={styles.storyErrorText}>{storyError}</Text>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.filterRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {FEED_FILTERS.map((filter, index) => (
          <View
            key={filter}
            style={[
              styles.filterChip,
              index === 0 ? styles.filterChipActive : null,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                index === 0 ? styles.filterTextActive : null,
              ]}
            >
              {filter}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.feedHeader}>
        <Text style={styles.feedTitle}>New today</Text>
        <Text style={styles.feedMeta}>{count} bài đăng</Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
});

FeedHeader.displayName = "FeedHeader";

const styles = StyleSheet.create({
  brand: {
    color: AppColors.text,
    fontFamily: AppFonts.brand,
    fontSize: 30,
    fontStyle: "italic",
  },
  content: {
    paddingBottom: 28,
  },
  emptyState: {
    paddingVertical: 28,
  },
  emptyText: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 14,
    paddingHorizontal: 18,
    paddingVertical: 28,
    textAlign: "center",
  },
  errorText: {
    color: AppColors.accent,
    fontFamily: AppFonts.body,
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 18,
  },
  feedHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },
  feedItem: {
    // paddingHorizontal: 18,
    paddingTop: 18,
  },
  feedMeta: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 13,
  },
  feedTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 20,
  },
  filterChip: {
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterChipActive: {
    backgroundColor: AppColors.text,
    borderColor: AppColors.text,
  },
  filterRow: {
    gap: 10,
    paddingHorizontal: 18,
  },
  filterText: {
    color: AppColors.muted,
    fontFamily: AppFonts.heading,
    fontSize: 13,
  },
  filterTextActive: {
    color: AppColors.surface,
  },
  footerLoader: {
    paddingVertical: 20,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  headerContent: {
    gap: 20,
    paddingTop: 6,
  },
  storyErrorText: {
    color: AppColors.accent,
    fontFamily: AppFonts.body,
    fontSize: 12,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  storySection: {
    paddingTop: 6,
  },
});
