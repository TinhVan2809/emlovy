import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import type { ComponentProps } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ScreenShell } from '@/components/screen-shell';
import { UserAvatar } from '@/components/user-avatar';
import { Routes } from '@/constants/routes';
import { AppColors, AppFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { followApi, postApi, profileApi, resolveMediaUrl } from '@/services/api';
import { subscribeToPostEvents } from '@/services/post-socket';
import type { Post, PostsPagination, Profile } from '@/types/auth';

type IconName = ComponentProps<typeof Ionicons>['name'];

const USER_POST_LIMIT = 15;

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

const formatDate = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getGenderLabel = (gender?: Profile['gender']) => {
  if (gender === '0') {
    return 'Nam';
  }

  if (gender === '1') {
    return 'Nữ';
  }

  if (gender === '2') {
    return 'Khác';
  }

  return null;
};

export default function UserProfileScreen() {
  const params = useLocalSearchParams();
  const rawUserId = Array.isArray(params.userId) ? params.userId[0] : params.userId;
  const viewedUserId = Number(rawUserId);
  const hasValidUserId = Number.isInteger(viewedUserId) && viewedUserId > 0;
  const { token, user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PostsPagination | null>(null);
  const [error, setError] = useState('');
  const [postError, setPostError] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFollowBusy, setIsFollowBusy] = useState(false);

  const isSelf = Boolean(profile?.is_self || Number(user?.user_id) === Number(viewedUserId));

  const loadProfile = useCallback(async () => {
    if (!hasValidUserId) {
      setError('Profile khong hop le.');
      return;
    }

    setIsLoadingProfile(true);

    try {
      const response = await profileApi.getUser(viewedUserId, token);
      setProfile(response.data.profile);
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Khong the tai profile.');
    } finally {
      setIsLoadingProfile(false);
    }
  }, [hasValidUserId, token, viewedUserId]);

  const loadPosts = useCallback(
    async (page = 1, replace = true) => {
      if (!hasValidUserId) {
        setPosts([]);
        setPagination(null);
        return;
      }

      if (replace) {
        setIsLoadingPosts(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await postApi.getUserPosts(viewedUserId, {
          limit: USER_POST_LIMIT,
          page,
          token,
        });
        setPagination(response.data.pagination);
        setPosts((current) =>
          replace ? response.data.items : mergePosts(current, response.data.items),
        );
        setPostError('');
      } catch (loadError) {
        setPostError(loadError instanceof Error ? loadError.message : 'Khong the tai bai viet.');
      } finally {
        setIsLoadingPosts(false);
        setIsLoadingMore(false);
      }
    },
    [hasValidUserId, token, viewedUserId],
  );

  useEffect(() => {
    loadProfile();
    loadPosts(1, true);
  }, [loadPosts, loadProfile]);

  useEffect(
    () =>
      subscribeToPostEvents({
        onCreated: (post) => {
          if (Number(post.user_id) !== Number(viewedUserId) || post.visibility !== 'public') {
            return;
          }

          setPosts((current) => {
            if (current.some((item) => item.post_id === post.post_id)) {
              return current;
            }

            return [post, ...current];
          });
          loadProfile();
        },
        onDeleted: ({ post_id }) => {
          setPosts((current) => current.filter((post) => post.post_id !== post_id));
          loadProfile();
        },
        onHidden: ({ post_id }) => {
          setPosts((current) => current.filter((post) => post.post_id !== post_id));
          loadProfile();
        },
        onUpdated: (post) => {
          if (Number(post.user_id) !== Number(viewedUserId)) {
            return;
          }

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
    [loadProfile, viewedUserId],
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      await Promise.all([loadProfile(), loadPosts(1, true)]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (!pagination?.hasMore || isLoadingMore || isLoadingPosts) {
      return;
    }

    loadPosts(pagination.page + 1, false);
  };

  const handleFollowToggle = async () => {
    if (!token) {
      setError('Bạn cần đăng nhập.');
      return;
    }

    if (!profile || isSelf || isFollowBusy) {
      return;
    }

    const previousProfile = profile;
    const shouldFollow = !profile.is_following;
    const followerDelta = shouldFollow ? 1 : -1;

    setIsFollowBusy(true);
    setProfile({
      ...profile,
      is_following: shouldFollow,
      stats: {
        ...profile.stats,
        followers: Math.max(0, profile.stats.followers + followerDelta),
      },
    });

    try {
      const response = shouldFollow
        ? await followApi.follow(token, viewedUserId)
        : await followApi.unfollow(token, viewedUserId);

      setProfile(response.data.profile);
      setError('');
    } catch (followError) {
      setProfile(previousProfile);
      setError(followError instanceof Error ? followError.message : 'Không thể cập nhật follow.');
    } finally {
      setIsFollowBusy(false);
    }
  };

  const handleMessage = () => {
    router.push({
      pathname: '/(chat)/chat',
      params: { userId: String(viewedUserId) },
    });
  };

  const infoItems = useMemo(() => {
    if (!profile) {
      return [];
    }

    return [
      { icon: 'at-outline' as IconName, label: 'Username', value: `@${profile.username}` },
      { icon: 'calendar-outline' as IconName, label: 'Tham gia', value: formatDate(profile.created_at) },
      { icon: 'person-outline' as IconName, label: 'Gioi tinh', value: getGenderLabel(profile.gender) },
      { icon: 'mail-outline' as IconName, label: 'Email', value: profile.email },
      { icon: 'call-outline' as IconName, label: 'Dien thoai', value: profile.phone },
    ].filter((item) => Boolean(item.value));
  }, [profile]);

  return (
    <ScreenShell
      left={
        <View style={styles.headerLeft}>
          <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backButton}>
            <Ionicons color={AppColors.text} name="arrow-back" size={23} />
          </Pressable>
          <View style={styles.headerTitleBlock}>
            <Text numberOfLines={1} style={styles.headerTitle}>
              {profile?.name ? `${profile.name}` : 'Profile'}
            </Text>
            <Text style={styles.headerSubtitle}>{profile?.username ? `@${profile.username}` : ''}</Text>
          </View>
        </View>
      }>
      <FlatList
        ListEmptyComponent={
          isLoadingPosts ? (
            <ActivityIndicator color={AppColors.accent} style={styles.emptyLoader} />
          ) : (
            <Text style={styles.emptyText}>Chua co bai viet public nao.</Text>
          )
        }
        ListFooterComponent={
          <ProfileFooter
            hasMore={Boolean(pagination?.hasMore)}
            isLoadingMore={isLoadingMore}
            loadedCount={posts.length}
            onLoadMore={handleLoadMore}
            total={pagination?.total || 0}
          />
        }
        ListHeaderComponent={
          <View style={styles.profileHeaderContent}>
            <ProfileHeader
              error={error}
              infoItems={infoItems}
              isFollowBusy={isFollowBusy}
              isLoadingProfile={isLoadingProfile}
              isSelf={isSelf}
              onEditSelf={() => router.push(Routes.editProfile)}
              onFollowToggle={handleFollowToggle}
              onMessage={handleMessage}
              postError={postError}
              profile={profile}
            />
          </View>
        }
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.content}
        data={posts}
        keyExtractor={(item) => String(item.post_id)}
        numColumns={3}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.45}
        refreshControl={
          <RefreshControl
            colors={[AppColors.accent]}
            onRefresh={handleRefresh}
            refreshing={isRefreshing}
            tintColor={AppColors.accent}
          />
        }
        renderItem={({ item }) => <PublicPostTile post={item} />}
        showsVerticalScrollIndicator={false}
      />
    </ScreenShell>
  );
}

function ProfileHeader({
  error,
  infoItems,
  isFollowBusy,
  isLoadingProfile,
  isSelf,
  onEditSelf,
  onFollowToggle,
  onMessage,
  postError,
  profile,
}: {
  error: string;
  infoItems: { icon: IconName; label: string; value: string | null }[];
  isFollowBusy: boolean;
  isLoadingProfile: boolean;
  isSelf: boolean;
  onEditSelf: () => void;
  onFollowToggle: () => void;
  onMessage: () => void;
  postError: string;
  profile: Profile | null;
}) {
  const displayName = profile?.name || 'Emlovy User';
  const displayHandle = profile?.username ? `@${profile.username}` : '@emlovy';
  const avatarUrl = resolveMediaUrl(profile?.avatar_url || profile?.avata);

  return (
    <View style={styles.profileCard}>
      <View style={styles.heroRow}>
        <UserAvatar imageUrl={avatarUrl} name={displayName} size={86} />

        <View style={styles.heroMeta}>
          <Text numberOfLines={1} style={styles.profileName}>
            {displayName}
          </Text>
          <Text numberOfLines={1} style={styles.profileHandle}>
            {displayHandle}
          </Text>
          {isLoadingProfile ? (
            <ActivityIndicator color={AppColors.accent} style={styles.profileLoader} />
          ) : null}
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Posts" value={profile?.stats.posts ?? 0} />
        <StatCard label="Followers" value={profile?.stats.followers ?? 0} />
        <StatCard label="Following" value={profile?.stats.following ?? 0} />
      </View>

      <View style={styles.actionsRow}>
        {isSelf ? (
          <Pressable
            onPress={onEditSelf}
            style={({ pressed }) => [
              styles.actionButton,
              styles.actionButtonPrimary,
              pressed ? styles.actionButtonPressed : null,
            ]}>
            <Ionicons color={AppColors.surface} name="create-outline" size={17} />
            <Text style={styles.actionButtonPrimaryText}>Edit profile</Text>
          </Pressable>
        ) : (
          <Pressable
            disabled={isFollowBusy}
            onPress={onFollowToggle}
            style={({ pressed }) => [
              styles.actionButton,
              profile?.is_following ? styles.actionButtonFollowing : styles.actionButtonPrimary,
              pressed ? styles.actionButtonPressed : null,
              isFollowBusy ? styles.actionButtonDisabled : null,
            ]}>
            {isFollowBusy ? (
              <ActivityIndicator color={profile?.is_following ? AppColors.text : AppColors.surface} size="small" />
            ) : (
              <Ionicons
                color={profile?.is_following ? AppColors.text : AppColors.surface}
                name={profile?.is_following ? 'checkmark' : 'person-add-outline'}
                size={17}
              />
            )}
            <Text
              style={[
                styles.actionButtonPrimaryText,
                profile?.is_following ? styles.actionButtonFollowingText : null,
              ]}>
              {profile?.is_following ? 'Đang follow' : 'Follow'}
            </Text>
          </Pressable>
        )}

        {!isSelf ? (
          <Pressable
            onPress={onMessage}
            style={({ pressed }) => [
              styles.actionButton,
              styles.actionButtonSecondary,
              pressed ? styles.actionButtonPressed : null,
            ]}>
            <Ionicons color={AppColors.text} name="chatbubble-ellipses-outline" size={17} />
            <Text style={styles.actionButtonText}>Nhắn tin</Text>
          </Pressable>
        ) : null}
      </View>

      {infoItems.length ? (
        <View style={styles.infoGrid}>
          {infoItems.map((item) => (
            <View key={item.label} style={styles.infoPill}>
              <Ionicons color={AppColors.muted} name={item.icon} size={16} />
              <View style={styles.infoTextBlock}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text numberOfLines={1} style={styles.infoValue}>
                  {item.value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.postsHeader}>
        <View>
          <Text style={styles.postsTitle}>Bài viết public</Text>
          <Text style={styles.postsSubtitle}>Những bài viết người này đang chia sẻ công khai.</Text>
        </View>
        <Ionicons color={AppColors.text} name="grid-outline" size={20} />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {postError ? <Text style={styles.errorText}>{postError}</Text> : null}
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function PublicPostTile({ post }: { post: Post }) {
  const imageUrl = resolveMediaUrl(post.media.find((item) => item.type === 'image')?.media_url);

  return (
    <View style={styles.gridItem}>
      {imageUrl ? (
        <Image contentFit="cover" source={{ uri: imageUrl }} style={styles.gridImage} />
      ) : (
        <View style={styles.gridFallback}>
          <Ionicons color={AppColors.muted} name="chatbox-outline" size={22} />
          <Text numberOfLines={3} style={styles.gridFallbackText}>
            {post.content || 'Post'}
          </Text>
        </View>
      )}

      <View style={styles.gridOverlay}>
        <View style={styles.gridMetric}>
          <Ionicons color={AppColors.surface} name="heart" size={13} />
          <Text style={styles.gridMetricText}>{post.like_count}</Text>
        </View>
        <View style={styles.gridMetric}>
          <Ionicons color={AppColors.surface} name="chatbubble" size={12} />
          <Text style={styles.gridMetricText}>{post.comment_count}</Text>
        </View>
      </View>
    </View>
  );
}

function ProfileFooter({
  hasMore,
  isLoadingMore,
  loadedCount,
  onLoadMore,
  total,
}: {
  hasMore: boolean;
  isLoadingMore: boolean;
  loadedCount: number;
  onLoadMore: () => void;
  total: number;
}) {
  if (isLoadingMore) {
    return <ActivityIndicator color={AppColors.accent} style={styles.footerLoader} />;
  }

  if (!total) {
    return null;
  }

  return (
    <View style={styles.footerContent}>
      <Text style={styles.paginationText}>
        Đã tải {loadedCount}/{total} bài viết
      </Text>
      {hasMore ? (
        <Pressable onPress={onLoadMore} style={styles.loadMoreButton}>
          <Text style={styles.loadMoreText}>Tải thêm</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 16,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  actionButtonDisabled: {
    opacity: 0.72,
  },
  actionButtonFollowing: {
    backgroundColor: AppColors.surfaceMuted,
    borderColor: AppColors.border,
    borderWidth: 1,
  },
  actionButtonFollowingText: {
    color: AppColors.text,
  },
  actionButtonPressed: {
    opacity: 0.86,
  },
  actionButtonPrimary: {
    backgroundColor: AppColors.text,
  },
  actionButtonPrimaryText: {
    color: AppColors.surface,
    fontFamily: AppFonts.heading,
    fontSize: 13,
  },
  actionButtonSecondary: {
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderWidth: 1,
  },
  actionButtonText: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  backButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  content: {
    paddingBottom: 28,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  emptyLoader: {
    paddingVertical: 26,
  },
  emptyText: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 14,
    paddingVertical: 26,
    textAlign: 'center',
  },
  errorText: {
    color: AppColors.accent,
    fontFamily: AppFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  footerContent: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  footerLoader: {
    paddingVertical: 20,
  },
  gridFallback: {
    alignItems: 'center',
    backgroundColor: AppColors.surfaceMuted,
    gap: 6,
    height: '100%',
    justifyContent: 'center',
    padding: 8,
    width: '100%',
  },
  gridFallbackText: {
    color: AppColors.text,
    fontFamily: AppFonts.body,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
  },
  gridImage: {
    height: '100%',
    width: '100%',
  },
  gridItem: {
    aspectRatio: 1,
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    width: '31.9%',
  },
  gridMetric: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  gridMetricText: {
    color: AppColors.surface,
    fontFamily: AppFonts.heading,
    fontSize: 11,
  },
  gridOverlay: {
    backgroundColor: 'rgba(20, 20, 20, 0.58)',
    bottom: 0,
    flexDirection: 'row',
    gap: 8,
    left: 0,
    paddingHorizontal: 7,
    paddingVertical: 5,
    position: 'absolute',
    right: 0,
  },
  gridRow: {
    gap: 8,
    marginBottom: 8,
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  headerSubtitle: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 12,
  },
  headerTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 18,
  },
  headerTitleBlock: {
    flex: 1,
  },
  heroMeta: {
    flex: 1,
  },
  heroRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  infoGrid: {
    gap: 10,
  },
  infoLabel: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 11,
  },
  infoPill: {
    alignItems: 'center',
    backgroundColor: AppColors.surfaceMuted,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoTextBlock: {
    flex: 1,
  },
  infoValue: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 13,
    paddingTop: 2,
  },
  loadMoreButton: {
    backgroundColor: AppColors.text,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  loadMoreText: {
    color: AppColors.surface,
    fontFamily: AppFonts.heading,
    fontSize: 13,
  },
  paginationText: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 12,
  },
  postsHeader: {
    alignItems: 'center',
    borderTopColor: AppColors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
  },
  postsSubtitle: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 12,
    lineHeight: 17,
    maxWidth: 260,
    paddingTop: 3,
  },
  postsTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 16,
  },
  profileCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 24,
    gap: 16,
    padding: 18,
  },
  profileHandle: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 13,
    paddingTop: 4,
  },
  profileHeaderContent: {
    paddingBottom: 18,
  },
  profileLoader: {
    alignSelf: 'flex-start',
    paddingTop: 8,
  },
  profileName: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 22,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: AppColors.surfaceMuted,
    borderRadius: 16,
    flex: 1,
    justifyContent: 'center',
    minHeight: 70,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  statLabel: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 12,
  },
  statValue: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 19,
    paddingBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
