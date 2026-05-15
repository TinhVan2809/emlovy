import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Routes } from '@/constants/routes';

import { CommentsSheet } from '@/components/comments-sheet';
import { PostCard } from '@/components/post-card';
import { PostComposerModal } from '@/components/post-composer-modal';
import { ScreenShell } from '@/components/screen-shell';
import { stories } from '@/constants/mock-content';
import { AppColors, AppFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { postApi } from '@/services/api';
import { subscribeToPostEvents } from '@/services/post-socket';
import type { Post, PostsPagination, UpdatePostInput } from '@/types/auth';

const FEED_LIMIT = 10;

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PostsPagination | null>(null);
  const [error, setError] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [commentPostId, setCommentPostId] = useState<number | null>(null);
  const [likingPostIds, setLikingPostIds] = useState<Set<number>>(() => new Set());

  const loadFeed = useCallback(async (page = 1, replace = true) => {
    if (replace) {
      setIsInitialLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await postApi.getFeed({ limit: FEED_LIMIT, page, token });
      setPagination(response.data.pagination);
      setPosts((current) => (replace ? response.data.items : mergePosts(current, response.data.items)));
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải feed.');
    } finally {
      setIsInitialLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  useEffect(
    () =>
      subscribeToPostEvents({
        onCreated: (post) => {
          setPosts((current) => {
            if (post.visibility !== 'public') {
              return current;
            }

            if (current.some((item) => item.post_id === post.post_id)) {
              return current;
            }

            return [post, ...current];
          });
        },
        onDeleted: ({ post_id }) => {
          setPosts((current) => current.filter((post) => post.post_id !== post_id));
        },
        onHidden: ({ post_id }) => {
          setPosts((current) => current.filter((post) => post.post_id !== post_id));
        },
        onUpdated: (post) => {
          setPosts((current) => {
            if (post.visibility !== 'public') {
              return current.filter((item) => item.post_id !== post.post_id);
            }

            return current.map((item) =>
              item.post_id === post.post_id ? { ...post, liked_by_me: item.liked_by_me } : item,
            );
          });
        },
      }),
    [],
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadFeed(1, true);
  };

  const handleLoadMore = () => {
    if (!pagination?.hasMore || isLoadingMore || isInitialLoading) {
      return;
    }

    loadFeed(pagination.page + 1, false);
  };

  const handleDeletePost = async (post: Post) => {
    if (!token) {
      setError('Bạn cần đăng nhập để xóa bài viết.');
      return;
    }

    setPosts((current) => current.filter((item) => item.post_id !== post.post_id));

    try {
      await postApi.delete(token, post.post_id);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Xóa bài viết thành công.');
      loadFeed(1, true);
    }
  };

  const handleSubmitEdit = async (input: UpdatePostInput) => {
    if (!token || !editingPost) {
      return;
    }

    setIsSubmittingEdit(true);

    try {
      const response = await postApi.update(token, editingPost.post_id, input);
      setPosts((current) =>
        current.map((post) => (post.post_id === response.data.post_id ? response.data : post)),
      );
      setEditingPost(null);
    } catch (editError) {
      setError(editError instanceof Error ? editError.message : 'Cập nhật bài viết không thành công.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const selectedCommentPost = commentPostId
    ? posts.find((post) => post.post_id === commentPostId) || null
    : null;

  const patchPost = (postId: number, patch: Partial<Post>) => {
    setPosts((current) => current.map((post) => (post.post_id === postId ? { ...post, ...patch } : post)));
  };

  const handleTogglePostLike = async (post: Post) => {
    if (!token) {
      setError('Ban can dang nhap de tha tym bai viet.');
      return;
    }

    if (likingPostIds.has(post.post_id)) {
      return;
    }

    const shouldLike = !post.liked_by_me;
    const optimisticLikeCount = Math.max(0, post.like_count + (shouldLike ? 1 : -1));

    setLikingPostIds((current) => {
      const next = new Set(current);
      next.add(post.post_id);
      return next;
    });
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
      setError('');
    } catch (likeError) {
      patchPost(post.post_id, {
        liked_by_me: post.liked_by_me,
        like_count: post.like_count,
      });
      setError(likeError instanceof Error ? likeError.message : 'Khong the cap nhat tym bai viet.');
    } finally {
      setLikingPostIds((current) => {
        const next = new Set(current);
        next.delete(post.post_id);
        return next;
      });
    }
  };

  const handlePostCommentCountChange = (postId: number, commentCount: number) => {
    patchPost(postId, { comment_count: commentCount });
  };

  return (
    <ScreenShell
      titleNode={<Text style={styles.brand}>emlovy</Text>}
      right={
        <View style={styles.headerActions}>
          <Ionicons color={AppColors.text} name="heart-outline" size={24} />
          <Pressable hitSlop={8} onPress={() => router.push(Routes.chat)}>
            <View>
              <Ionicons color={AppColors.text} name="paper-plane-outline" size={24} />
              <View style={styles.badge} />
            </View>
          </Pressable>
        </View>
      }>
      <FlatList
        ListEmptyComponent={
          isInitialLoading ? (
            <ActivityIndicator color={AppColors.accent} style={styles.emptyState} />
          ) : (
            <Text style={styles.emptyText}>Chưa có bài viết nào.</Text>
          )
        }
        ListFooterComponent={
          isLoadingMore ? <ActivityIndicator color={AppColors.accent} style={styles.footerLoader} /> : null
        }
        ListHeaderComponent={<FeedHeader count={pagination?.total || posts.length} error={error} />}
        contentContainerStyle={styles.content}
        data={posts}
        keyExtractor={(item) => String(item.post_id)}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.55}
        refreshControl={
          <RefreshControl
            colors={[AppColors.accent]}
            onRefresh={handleRefresh}
            refreshing={isRefreshing}
            tintColor={AppColors.accent}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.feedItem}>
            <PostCard
              currentUserId={user?.user_id}
              onDelete={handleDeletePost}
              onEdit={setEditingPost}
              onOpenComments={(post) => setCommentPostId(post.post_id)}
              onToggleLike={handleTogglePostLike}
              post={item}
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      <PostComposerModal
        initialPost={editingPost}
        isSubmitting={isSubmittingEdit}
        mode="edit"
        onClose={() => setEditingPost(null)}
        onSubmit={(input) => handleSubmitEdit(input as UpdatePostInput)}
        visible={Boolean(editingPost)}
      />

      <CommentsSheet
        onClose={() => setCommentPostId(null)}
        onPostCommentCountChange={handlePostCommentCountChange}
        post={selectedCommentPost}
        token={token}
        visible={Boolean(selectedCommentPost)}
      />
    </ScreenShell>
  );
}

function FeedHeader({ count, error }: { count: number; error: string }) {
  return (
    <View style={styles.headerContent}>
      <View style={styles.storySection}>
        <ScrollView contentContainerStyle={styles.storyRow} horizontal showsHorizontalScrollIndicator={false}>
          {stories.map((story) => (
            <View key={story.id} style={styles.storyItem}>
              <View style={[styles.storyRing, { backgroundColor: story.accent }]}>
                <View style={[styles.storyCore, { backgroundColor: story.tone }]}>
                  <Text style={styles.storyInitial}>{story.initials}</Text>
                </View>
                {story.isOwn ? (
                  <View style={styles.storyPlus}>
                    <Ionicons color={AppColors.surface} name="add" size={12} />
                  </View>
                ) : null}
              </View>
              <Text numberOfLines={1} style={styles.storyName}>
                {story.name}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.filterRow} horizontal showsHorizontalScrollIndicator={false}>
        {['Dành cho bạn', 'Following', 'Fresh drops', 'Saved'].map((filter, index) => (
          <View key={filter} style={[styles.filterChip, index === 0 ? styles.filterChipActive : null]}>
            <Text style={[styles.filterText, index === 0 ? styles.filterTextActive : null]}>{filter}</Text>
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
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: AppColors.accent,
    borderColor: AppColors.surface,
    borderRadius: 5,
    borderWidth: 2,
    height: 10,
    position: 'absolute',
    right: -2,
    top: -1,
    width: 10,
  },
  brand: {
    color: AppColors.text,
    fontFamily: AppFonts.brand,
    fontSize: 30,
    fontStyle: 'italic',
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
    textAlign: 'center',
  },
  errorText: {
    color: AppColors.accent,
    fontFamily: AppFonts.body,
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 18,
  },
  feedHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  feedItem: {
    paddingHorizontal: 18,
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
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  headerContent: {
    gap: 20,
    paddingTop: 6,
  },
  storyCore: {
    alignItems: 'center',
    borderColor: AppColors.surface,
    borderRadius: 28,
    borderWidth: 3,
    flex: 1,
    justifyContent: 'center',
  },
  storyInitial: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 18,
  },
  storyItem: {
    alignItems: 'center',
    gap: 8,
    width: 74,
  },
  storyName: {
    color: AppColors.text,
    fontFamily: AppFonts.body,
    fontSize: 12,
  },
  storyPlus: {
    alignItems: 'center',
    backgroundColor: AppColors.success,
    borderColor: AppColors.surface,
    borderRadius: 10,
    borderWidth: 2,
    bottom: -2,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: -1,
    width: 20,
  },
  storyRing: {
    borderRadius: 34,
    height: 68,
    justifyContent: 'center',
    padding: 3,
    width: 68,
  },
  storyRow: {
    gap: 14,
    paddingHorizontal: 18,
  },
  storySection: {
    paddingTop: 6,
  },
});
