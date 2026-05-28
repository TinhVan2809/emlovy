import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { PostComposerModal } from "@/components/post-composer-modal";
import { ScreenShell } from "@/components/screen-shell";
import { StoryComposerModal } from "@/components/story-composer-modal";
import { UserAvatar } from "@/components/user-avatar";
import { Routes, followRoutes, postRoutes } from "@/constants/routes";
import { profileHighlights } from "@/constants/mock-content";
import { AppColors, AppFonts } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { postApi, profileApi, resolveMediaUrl, storyApi } from "@/services/api";
import { subscribeToPostEvents } from "@/services/post-socket";
import { subscribeToStoryEvents } from "@/services/story-socket";

import type {
  CreatePostInput,
  CreateStoryInput,
  Post,
  PostsPagination,
  Profile,
  StoryItem,
  UpdatePostInput,
  UpdateStoryInput,
} from "@/types/auth";

const PROFILE_POST_LIMIT = 15;

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

export default function ProfileScreen() {
  const { signOut, token, user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PostsPagination | null>(null);
  const [error, setError] = useState("");
  const [postError, setPostError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [composerVisible, setComposerVisible] = useState(false);
  const [composerMode, setComposerMode] = useState<"create" | "edit">("create");
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [storyError, setStoryError] = useState("");
  const [storyComposerVisible, setStoryComposerVisible] = useState(false);
  const [storyComposerMode, setStoryComposerMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingStory, setEditingStory] = useState<StoryItem | null>(null);
  const [isSubmittingStory, setIsSubmittingStory] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const response = await profileApi.getMe(token);
      setProfile(response.data.profile);
      setError("");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải profile.",
      );
    }
  }, [token]);

  const loadMyPosts = useCallback(
    async (page = 1, replace = true) => {
      if (!token) {
        return;
      }

      if (replace) {
        setIsLoadingPosts(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await postApi.getMyPosts(token, {
          limit: PROFILE_POST_LIMIT,
          page,
        });
        setPagination(response.data.pagination);
        setPosts((current) =>
          replace
            ? response.data.items
            : mergePosts(current, response.data.items),
        );
        setPostError("");
      } catch (loadError) {
        setPostError(
          loadError instanceof Error
            ? loadError.message
            : "Không thể tải bài viết.",
        );
      } finally {
        setIsLoadingPosts(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }
    },
    [token],
  );

  const loadMyStories = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const response = await storyApi.getMine(token);
      setStories(response.data.stories);
      setStoryError("");
    } catch (loadError) {
      setStoryError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải stories.",
      );
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      loadMyPosts(1, true);
      loadMyStories();
    }, [loadMyPosts, loadMyStories, loadProfile]),
  );

  useEffect(() => {
    if (!user?.user_id) {
      return undefined;
    }

    return subscribeToPostEvents({
      onCreated: (post) => {
        if (Number(post.user_id) !== Number(user.user_id)) {
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
        setPosts((current) =>
          current.filter((post) => post.post_id !== post_id),
        );
        loadProfile();
      },
      onUpdated: (post) => {
        if (Number(post.user_id) !== Number(user.user_id)) {
          return;
        }

        setPosts((current) =>
          current.map((item) => (item.post_id === post.post_id ? post : item)),
        );
      },
    });
  }, [loadProfile, user?.user_id]);

  useEffect(() => {
    if (!user?.user_id) {
      return undefined;
    }

    const reloadOwnStories = (story?: StoryItem | { user_id?: number }) => {
      if (!story || Number(story.user_id) === Number(user.user_id)) {
        loadMyStories();
      }
    };

    return subscribeToStoryEvents({
      onCreated: reloadOwnStories,
      onDeleted: reloadOwnStories,
      onExpired: () => loadMyStories(),
      onUpdated: reloadOwnStories,
    });
  }, [loadMyStories, user?.user_id]);

  const displayUser = profile || user;
  const displayName = displayUser?.name || "Emlovy User";
  const displayHandle = displayUser?.username
    ? `@${displayUser.username}`
    : "@emlovy";
  const avatarUrl = resolveMediaUrl(
    displayUser?.avatar_url || displayUser?.avata,
  );
  const stats = [
    {
      label: "Posts",
      value: String(profile?.stats.posts ?? posts.length),
      route: () => router.push(postRoutes.posts),
    },
    {
      label: "Followers",
      value: String(profile?.stats.followers ?? 0),
      route: () => router.push(followRoutes.followers),
    },
    {
      label: "Following",
      value: String(profile?.stats.following ?? 0),
      route: () => router.push(followRoutes.following),
    },
  ];

  const openCreateComposer = () => {
    setComposerMode("create");
    setEditingPost(null);
    setComposerVisible(true);
  };

  const openEditComposer = (post: Post) => {
    setComposerMode("edit");
    setEditingPost(post);
    setComposerVisible(true);
  };

  const closeComposer = () => {
    if (isSubmittingPost) {
      return;
    }

    setComposerVisible(false);
    setEditingPost(null);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadProfile();
    loadMyStories();
    loadMyPosts(1, true);
  };

  const handleLoadMore = () => {
    if (!pagination?.hasMore || isLoadingMore || isLoadingPosts) {
      return;
    }

    loadMyPosts(pagination.page + 1, false);
  };

  const handleSubmitPost = async (input: CreatePostInput | UpdatePostInput) => {
    if (!token) {
      setPostError("Bạn cần đăng nhập để đăng bài.");
      return;
    }

    setIsSubmittingPost(true);

    try {
      if (composerMode === "edit" && editingPost) {
        const response = await postApi.update(
          token,
          editingPost.post_id,
          input as UpdatePostInput,
        );
        setPosts((current) =>
          current.map((post) =>
            post.post_id === response.data.post_id ? response.data : post,
          ),
        );
      } else {
        const response = await postApi.create(token, input as CreatePostInput);
        setPosts((current) => {
          if (current.some((post) => post.post_id === response.data.post_id)) {
            return current;
          }

          return [response.data, ...current];
        });
        loadProfile();
      }

      setComposerVisible(false);
      setEditingPost(null);
      setPostError("");
    } catch (submitError) {
      setPostError(
        submitError instanceof Error
          ? submitError.message
          : "Lưu bài viết không thành công.",
      );
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const confirmDeletePost = (post: Post) => {
    Alert.alert("Xóa bài viết", "Bài viết sẽ được gỡ khỏi profile và feed.", [
      { style: "cancel", text: "Hủy" },
      {
        onPress: () => handleDeletePost(post),
        style: "destructive",
        text: "Xóa",
      },
    ]);
  };

  const handleDeletePost = async (post: Post) => {
    if (!token) {
      setPostError("Bạn cần đăng nhập để xóa bài viết.");
      return;
    }

    const previousPosts = posts;
    setPosts((current) =>
      current.filter((item) => item.post_id !== post.post_id),
    );

    try {
      await postApi.delete(token, post.post_id);
      loadProfile();
    } catch (deleteError) {
      setPosts(previousPosts);
      setPostError(
        deleteError instanceof Error
          ? deleteError.message
          : "Xóa bài viết không thành công.",
      );
    }
  };

  const openCreateStoryComposer = () => {
    setStoryComposerMode("create");
    setEditingStory(null);
    setStoryComposerVisible(true);
  };

  const openEditStoryComposer = (story: StoryItem) => {
    setStoryComposerMode("edit");
    setEditingStory(story);
    setStoryComposerVisible(true);
  };

  const closeStoryComposer = () => {
    if (isSubmittingStory) {
      return;
    }

    setStoryComposerVisible(false);
    setEditingStory(null);
  };

  const handleSubmitStory = async (
    input: CreateStoryInput | UpdateStoryInput,
  ) => {
    if (!token) {
      setStoryError("Bạn cần đăng nhập để tạo story.");
      return;
    }

    setIsSubmittingStory(true);

    try {
      if (storyComposerMode === "edit" && editingStory) {
        const response = await storyApi.update(
          token,
          editingStory.story_id,
          input as UpdateStoryInput,
        );
        setStories((current) =>
          current.map((story) =>
            story.story_id === response.data.story_id ? response.data : story,
          ),
        );
      } else {
        const response = await storyApi.create(
          token,
          input as CreateStoryInput,
        );
        setStories((current) => [response.data, ...current]);
      }

      setStoryError("");
      setStoryComposerVisible(false);
      setEditingStory(null);
    } catch (submitError) {
      setStoryError(
        submitError instanceof Error
          ? submitError.message
          : "Khong the luu story.",
      );
    } finally {
      setIsSubmittingStory(false);
    }
  };

  const confirmDeleteStory = (story: StoryItem) => {
    Alert.alert(
      "Xóa strory?",
      "Story sẽ được xóa và không thể khôi phục. Xác nhận xóa?",
      [
        { style: "cancel", text: "Hủy" },
        {
          onPress: () => handleDeleteStory(story),
          style: "destructive",
          text: "Xóa",
        },
      ],
    );
  };

  const handleDeleteStory = async (story: StoryItem) => {
    if (!token) {
      setStoryError("Bạn cần đăng nhập để xóa story.");
      return;
    }

    const previousStories = stories;
    setStories((current) =>
      current.filter((item) => item.story_id !== story.story_id),
    );

    try {
      await storyApi.delete(token, story.story_id);
      setStoryError("");
    } catch (deleteError) {
      setStories(previousStories);
      setStoryError(
        deleteError instanceof Error
          ? deleteError.message
          : "Xóa story thành công.",
      );
    }
  };

  return (
    <>
      <ScreenShell
        titleNode={
          <View style={styles.titleRow}>
            <Text style={styles.profileHandle}>{displayHandle}</Text>
            <Ionicons color={AppColors.text} name="chevron-down" size={18} />
          </View>
        }
        right={
          <View style={styles.headerActions}>
            <Pressable hitSlop={10} onPress={openCreateComposer}>
              <Ionicons
                color={AppColors.text}
                name="add-circle-outline"
                size={25}
              />
            </Pressable>
            <Pressable hitSlop={10} onPress={signOut}>
              <Ionicons
                color={AppColors.text}
                name="log-out-outline"
                size={24}
              />
            </Pressable>
          </View>
        }
      >
        <FlatList
          ListEmptyComponent={
            isLoadingPosts ? (
              <ActivityIndicator
                color={AppColors.accent}
                style={styles.emptyGrid}
              />
            ) : (
              <Text style={styles.emptyGridText}>
                Hãy đăng bài viết đầu tiên của bạn.
              </Text>
            )
          }
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator
                color={AppColors.accent}
                style={styles.footerLoader}
              />
            ) : null
          }
          ListHeaderComponent={
            <View style={styles.profileHeaderContent}>
              <View style={styles.profileCard}>
                <View style={styles.topRow}>
                  <UserAvatar imageUrl={avatarUrl} name={displayName} />

                  <View style={styles.statsRow}>
                    {stats.map((stat) => (
                      <Pressable
                        key={stat.label}
                        style={styles.statCard}
                        onPress={stat.route}
                      >
                        <Text style={styles.statValue}>{stat.value}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {displayUser?.is_verified === 1 ? (
                  <View style={styles.nameVerified}>
                    <Text style={styles.profileName}>{displayName}</Text>
                    <Ionicons name="checkmark" style={styles.checkMark} />
                  </View>
                ) : (
                  <View style={styles.nameVerified}>
                    <Text style={styles.profileName}>{displayName} </Text>
                  </View>
                )}

                <Text style={styles.profileBio}>
                  {displayUser?.email ||
                    displayUser?.phone ||
                    "Curated moments and daily moodboards."}
                </Text>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <View style={styles.buttonRowContainer}>
                  <View style={styles.buttonRow}>
                    {/* Edit trang cá nhân */}
                    <Pressable
                      onPress={() => router.push(Routes.editProfile)}
                      style={({ pressed }) => [
                        styles.actionButton,
                        styles.actionButtonPrimary,
                        pressed ? styles.actionButtonPressed : null,
                      ]}
                    >
                      <Text style={styles.actionButtonPrimaryText}>
                        Chỉnh sửa
                      </Text>
                    </Pressable>

                    {/* Chia sẽ trang cá nhân*/}
                    <Pressable
                      style={({ pressed }) => [
                        styles.actionButton,
                        pressed ? styles.actionButtonPressed : null,
                      ]}
                    >
                      <Text style={styles.actionButtonText}>Chia sẽ</Text>
                    </Pressable>
                  </View>

                  <View style={styles.buttonRow}>
                    {/* Setting */}
                    <Pressable onPress={() => router.push(Routes.setting)}>
                      <Ionicons
                        color={AppColors.text}
                        name="settings-outline"
                        size={25}
                      />
                    </Pressable>

                    {/* Xem kho lưu trữ*/}
                    <Pressable
                      style={({ pressed }) => [
                        styles.actionButton,
                        pressed ? styles.actionButtonPressed : null,
                      ]}
                    >
                      <Text style={styles.actionButtonText}>
                        Xem kho lưu trữ
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              <ScrollView
                contentContainerStyle={styles.highlightRow}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {profileHighlights.map((item) => (
                  <View key={item.id} style={styles.highlightItem}>
                    <View
                      style={[
                        styles.highlightRing,
                        { backgroundColor: item.accent },
                      ]}
                    >
                      <View
                        style={[
                          styles.highlightCore,
                          { backgroundColor: item.tone },
                        ]}
                      >
                        <Text style={styles.highlightText}>
                          {item.initials}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.highlightName}>{item.name}</Text>
                  </View>
                ))}
              </ScrollView>

              <ProfileStoryIconSection
                error={storyError}
                onCreate={openCreateStoryComposer}
                onDelete={confirmDeleteStory}
                onEdit={openEditStoryComposer}
                stories={stories}
              />

              <View style={styles.segmentedBar}>
                <View
                  style={[styles.segmentedIcon, styles.segmentedIconActive]}
                >
                  <Ionicons
                    color={AppColors.text}
                    name="grid-outline"
                    size={20}
                  />
                </View>
                <View style={styles.segmentedIcon}>
                  <Ionicons
                    color={AppColors.tabInactive}
                    name="play-circle-outline"
                    size={20}
                  />
                </View>
                <View style={styles.segmentedIcon}>
                  <Ionicons
                    color={AppColors.tabInactive}
                    name="person-outline"
                    size={20}
                  />
                </View>
              </View>

              {postError ? (
                <Text style={styles.errorText}>{postError}</Text>
              ) : null}
            </View>
          }
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.content}
          data={posts}
          keyExtractor={(item) => String(item.post_id)}
          numColumns={3}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              colors={[AppColors.accent]}
              onRefresh={handleRefresh}
              refreshing={isRefreshing}
              tintColor={AppColors.accent}
            />
          }
          renderItem={({ item }) => (
            <ProfilePostTile
              onDelete={confirmDeletePost}
              onEdit={openEditComposer}
              post={item}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
        <PostComposerModal
          initialPost={editingPost}
          isSubmitting={isSubmittingPost}
          mode={composerMode}
          onClose={closeComposer}
          onSubmit={handleSubmitPost}
          visible={composerVisible}
        />

        <StoryComposerModal
          initialStory={editingStory}
          isSubmitting={isSubmittingStory}
          mode={storyComposerMode}
          onClose={closeStoryComposer}
          onSubmit={handleSubmitStory}
          visible={storyComposerVisible}
        />
      </ScreenShell>
    </>
  );
}

function ProfileStoryIconSection({
  error,
  onCreate,
  onDelete,
  onEdit,
  stories,
}: {
  error: string;
  onCreate: () => void;
  onDelete: (story: StoryItem) => void;
  onEdit: (story: StoryItem) => void;
  stories: StoryItem[];
}) {
  return (
    <View style={styles.profileStoryIconSection}>
      <View style={styles.profileStoryIconHeader}>
        <View style={styles.profileStoryIconTitleRow}>
          <View style={styles.profileStoryIconBadge}>
            <Ionicons
              color={AppColors.surface}
              name="ellipse-outline"
              size={16}
            />
          </View>
          <Text style={styles.profileStoriesTitle}>Stories</Text>
        </View>

        <Pressable
          hitSlop={8}
          onPress={onCreate}
          style={styles.profileStoriesAdd}
        >
          <Ionicons color={AppColors.surface} name="add" size={16} />
        </Pressable>
      </View>

      <ProfileStoryStrip
        onCreate={onCreate}
        onDelete={onDelete}
        onEdit={onEdit}
        showHeader={false}
        stories={stories}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function ProfileStoryStrip({
  onCreate,
  onDelete,
  onEdit,
  showHeader = true,
  stories,
}: {
  onCreate: () => void;
  onDelete: (story: StoryItem) => void;
  onEdit: (story: StoryItem) => void;
  showHeader?: boolean;
  stories: StoryItem[];
}) {
  return (
    <View style={styles.profileStoriesBlock}>
      {showHeader ? (
        <View style={styles.profileStoriesHeader}>
          <Text style={styles.profileStoriesTitle}>Stories</Text>
          <Pressable
            hitSlop={8}
            onPress={onCreate}
            style={styles.profileStoriesAdd}
          >
            <Ionicons color={AppColors.surface} name="add" size={16} />
          </Pressable>
        </View>
      ) : null}
      <ScrollView
        contentContainerStyle={styles.profileStoriesRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <Pressable onPress={onCreate} style={styles.profileStoryCreateTile}>
          <Ionicons color={AppColors.muted} name="add" size={22} />
          <Text style={styles.profileStoryCreateText}>Story</Text>
        </Pressable>
        {stories.map((story) => (
          <ProfileStoryTile
            key={story.story_id}
            onDelete={onDelete}
            onEdit={onEdit}
            story={story}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function ProfileStoryTile({
  onDelete,
  onEdit,
  story,
}: {
  onDelete: (story: StoryItem) => void;
  onEdit: (story: StoryItem) => void;
  story: StoryItem;
}) {
  const imageUrl = resolveMediaUrl(
    story.media.find((item) => item.type === "image")?.media_url,
  );

  return (
    <Pressable onPress={() => onEdit(story)} style={styles.profileStoryTile}>
      <View
        style={[
          styles.profileStoryPreview,
          { backgroundColor: story.background_color || AppColors.surfaceMuted },
        ]}
      >
        {imageUrl ? (
          <Image
            contentFit="cover"
            source={{ uri: imageUrl }}
            style={styles.profileStoryImage}
          />
        ) : null}
        <View style={styles.profileStoryShade} />
        <Text numberOfLines={3} style={styles.profileStoryText}>
          {story.content || "Story"}
        </Text>
      </View>
      <View style={styles.profileStoryControls}>
        <View style={styles.gridControlPill}>
          <Ionicons color={AppColors.surface} name="create-outline" size={13} />
        </View>
        <Pressable
          hitSlop={8}
          onPress={(event) => {
            event.stopPropagation();
            onDelete(story);
          }}
          style={styles.gridControlPill}
        >
          <Ionicons color={AppColors.surface} name="trash-outline" size={13} />
        </Pressable>
      </View>
    </Pressable>
  );
}

function ProfilePostTile({
  onDelete,
  onEdit,
  post,
}: {
  onDelete: (post: Post) => void;
  onEdit: (post: Post) => void;
  post: Post;
}) {
  const imageUrl = resolveMediaUrl(
    post.media.find((item) => item.type === "image")?.media_url,
  );

  return (
    <Pressable
      onPress={() => onEdit(post)}
      style={({ pressed }) => [
        styles.gridItem,
        pressed ? styles.gridPressed : null,
      ]}
    >
      {imageUrl ? (
        <Image
          contentFit="cover"
          source={{ uri: imageUrl }}
          style={styles.gridImage}
        />
      ) : (
        <View style={styles.gridFallback}>
          <Ionicons color={AppColors.muted} name="chatbox-outline" size={22} />
          <Text numberOfLines={3} style={styles.gridFallbackText}>
            {post.content || "Post"}
          </Text>
        </View>
      )}

      <View style={styles.gridControls}>
        <View style={styles.gridControlPill}>
          <Ionicons color={AppColors.surface} name="create-outline" size={13} />
        </View>
        <Pressable
          hitSlop={8}
          onPress={(event) => {
            event.stopPropagation();
            onDelete(post);
          }}
          style={styles.gridControlPill}
        >
          <Ionicons color={AppColors.surface} name="trash-outline" size={13} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 12,
  },
  actionButtonPressed: {
    opacity: 0.86,
  },
  actionButtonPrimary: {
    backgroundColor: AppColors.text,
    borderColor: AppColors.text,
  },
  actionButtonPrimaryText: {
    color: AppColors.surface,
    fontFamily: AppFonts.heading,
    fontSize: 13,
  },
  actionButtonText: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 13,
  },

  buttonRowContainer: {
    gap: 15,
    paddingTop: 18,
  },
  buttonRow: {
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  content: {
    paddingBottom: 28,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  emptyGrid: {
    paddingVertical: 24,
  },
  emptyGridText: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 14,
    paddingVertical: 24,
    textAlign: "center",
  },
  errorText: {
    color: AppColors.accent,
    fontFamily: AppFonts.body,
    fontSize: 13,
    lineHeight: 18,
    paddingTop: 10,
  },
  footerLoader: {
    paddingVertical: 20,
  },
  gridControls: {
    flexDirection: "row",
    gap: 5,
    position: "absolute",
    right: 6,
    top: 6,
  },
  gridControlPill: {
    alignItems: "center",
    backgroundColor: "rgba(22, 22, 22, 0.74)",
    borderRadius: 12,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  gridFallback: {
    alignItems: "center",
    backgroundColor: AppColors.surfaceMuted,
    gap: 6,
    height: "100%",
    justifyContent: "center",
    padding: 8,
    width: "100%",
  },
  gridFallbackText: {
    color: AppColors.text,
    fontFamily: AppFonts.body,
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center",
  },
  gridImage: {
    height: "100%",
    width: "100%",
  },
  gridItem: {
    aspectRatio: 1,
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    width: "31.9%",
  },
  gridPressed: {
    opacity: 0.88,
  },
  gridRow: {
    gap: 8,
    marginBottom: 8,
  },
  headerActions: {
    flexDirection: "row",
    gap: 14,
  },
  highlightCore: {
    alignItems: "center",
    borderColor: AppColors.surface,
    borderRadius: 32,
    borderWidth: 3,
    flex: 1,
    justifyContent: "center",
  },
  highlightItem: {
    alignItems: "center",
    gap: 8,
    width: 78,
  },
  highlightName: {
    color: AppColors.text,
    fontFamily: AppFonts.body,
    fontSize: 12,
  },
  highlightRing: {
    borderRadius: 38,
    height: 76,
    justifyContent: "center",
    padding: 3,
    width: 76,
  },
  highlightRow: {
    gap: 14,
  },
  highlightText: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 20,
  },
  profileBio: {
    color: AppColors.text,
    fontFamily: AppFonts.body,
    fontSize: 14,
    lineHeight: 21,
    paddingTop: 8,
  },
  profileCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 28,
    padding: 10,
  },
  profileHandle: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 22,
  },
  profileHeaderContent: {
    gap: 18,
    paddingBottom: 18,
  },
  nameVerified: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingTop: 16,
  },
  profileName: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 18,
  },
  checkMark: {
    color: "#ffffff",
    backgroundColor: "#2040e4",
    borderRadius: 30,
    padding: 1,
  },
  profileStoryIconBadge: {
    alignItems: "center",
    backgroundColor: AppColors.accent,
    borderRadius: 15,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  profileStoryIconHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  profileStoryIconSection: {
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  profileStoryIconTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  profileStoriesAdd: {
    alignItems: "center",
    backgroundColor: AppColors.text,
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  profileStoriesBlock: {
    gap: 12,
  },
  profileStoriesHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  profileStoriesRow: {
    gap: 12,
  },
  profileStoriesTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 16,
  },
  profileStoryControls: {
    flexDirection: "row",
    gap: 5,
    position: "absolute",
    right: 6,
    top: 6,
  },
  profileStoryCreateText: {
    color: AppColors.muted,
    fontFamily: AppFonts.heading,
    fontSize: 12,
  },
  profileStoryCreateTile: {
    alignItems: "center",
    aspectRatio: 9 / 16,
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 18,
    borderStyle: "dashed",
    borderWidth: 1,
    gap: 6,
    justifyContent: "center",
    overflow: "hidden",
    width: 84,
  },
  profileStoryImage: {
    height: "100%",
    width: "100%",
  },
  profileStoryPreview: {
    alignItems: "center",
    borderRadius: 18,
    height: "100%",
    justifyContent: "center",
    overflow: "hidden",
    width: "100%",
  },
  profileStoryShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.16)",
  },
  profileStoryText: {
    color: AppColors.surface,
    fontFamily: AppFonts.heading,
    fontSize: 12,
    lineHeight: 16,
    paddingHorizontal: 8,
    textAlign: "center",
  },
  profileStoryTile: {
    aspectRatio: 9 / 16,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    width: 84,
  },
  segmentedBar: {
    backgroundColor: AppColors.surface,
    borderRadius: 20,
    flexDirection: "row",
    padding: 6,
  },
  segmentedIcon: {
    alignItems: "center",
    borderRadius: 14,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 10,
  },
  segmentedIconActive: {
    backgroundColor: AppColors.surfaceMuted,
  },
  statCard: {
    alignItems: "center",
    // backgroundColor: AppColors.surfaceMuted,
    borderRadius: 18,
    flex: 1,
    justifyContent: "flex-start",
    minHeight: 70,
    // paddingHorizontal: 10,
    // paddingVertical: 10,
  },
  statLabel: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 12,
  },
  statValue: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 18,
    paddingBottom: 4,
  },
  statsRow: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
  },
});
