import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { memo, useCallback, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SealCheckIcon } from "phosphor-react-native";

import { UserAvatar } from "@/components/user-avatar";
import { VisualTile } from "@/components/visual-tile";
import ImageViewer from "@/components/image-viewer";
import { AppColors, AppFonts } from "@/constants/theme";
import { resolveMediaUrl } from "@/services/api";
import type { Post } from "@/types/auth";

type PostCardProps = {
  currentUserId?: number | null;
  onDelete?: (post: Post) => void;
  onEdit?: (post: Post) => void;
  onOpenAuthor?: (post: Post) => void;
  onOpenComments?: (post: Post) => void;
  onToggleLike?: (post: Post) => void;
  post: Post;
};

const PostImage = memo(({ 
  uri, 
  width, 
  maxHeight, 
  onPress, 
  backgroundColor 
}: { uri: string; width: number; maxHeight: number; onPress: () => void; backgroundColor?: string }) => {
  const [displayHeight, setDisplayHeight] = useState<number>(width);

  return (
    <Pressable
      onPress={onPress}
      style={{
        width: width,
        height: displayHeight,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: backgroundColor || AppColors.surfaceMuted,
      }}
    >
      <Image
        contentFit="contain"
        source={{ uri }}
        onLoad={(e) => {
          const { width: w, height: h } = e.source;
          if (w && h) {
            const ratio = w / h;
            // Tính toán chiều cao mục tiêu dựa trên chiều rộng màn hình
            const targetHeight = width / ratio;
            setDisplayHeight(Math.min(targetHeight, maxHeight));
          }
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </Pressable>
  );
});

PostImage.displayName = "PostImage";

const palette = [
  { accent: "#FF7A59", tone: "#FFE1D6" },
  { accent: "#46B07D", tone: "#D9EFE1" },
  { accent: "#5B86FF", tone: "#DDE7FF" },
  { accent: "#D56AE0", tone: "#F5DCF9" },
];

const formatRelativeTime = (value: string) => {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();

  if (!Number.isFinite(diffMs)) {
    return "";
  }

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) {
    return "vừa xong";
  }

  if (diffMs < hour) {
    return `${Math.floor(diffMs / minute)} phút trước`;
  }

  if (diffMs < day) {
    return `${Math.floor(diffMs / hour)} giờ trước`;
  }

  return `${Math.floor(diffMs / day)} ngày trước`;
};

const PostCard = memo(function PostCard({
  currentUserId,
  onDelete,
  onEdit,
  onOpenAuthor,
  onOpenComments,
  onToggleLike,
  post,
}: PostCardProps) {
  const { width } = useWindowDimensions();
  const [showOwnerActions, setShowOwnerActions] = useState(false);
  const [showUsersACtions, setShowUsersActions] = useState(false);
  const ownerCanManage = Number(currentUserId) === Number(post.user_id);
  const mediaWidth = width;
  const fallbackTone = palette[post.post_id % palette.length];
  const authorName = post.author?.name || "Emlovy User";
  const authorHandle = post.author?.username
    ? `@${post.author.username}`
    : "@emlovy";
  const avatarUrl = resolveMediaUrl(
    post.author?.avatar_url || post.author?.avata,
  );

  const imageUrls = useMemo(
    () =>
      post.media
        .filter((item) => item.type === "image")
        .map((item) => resolveMediaUrl(item.media_url))
        .filter(Boolean) as string[],
    [post.media],
  );

  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const handleDelete = useCallback(() => {
    Alert.alert("Xóa bài viết", "Bạn chắc chắn muốn xóa bài viết này?", [
      { style: "cancel", text: " Hủy" },
      {
        onPress: () => onDelete?.(post),
        style: "destructive",
        text: "Xóa",
      },
    ]);
  }, [onDelete, post]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable
          disabled={!onOpenAuthor}
          onPress={() => onOpenAuthor?.(post)}
          style={styles.userRow}
        >
          <UserAvatar imageUrl={avatarUrl} name={authorName} size={48} />

          <View style={styles.userMeta}>
            {post.author.is_verified === 1 ? (
              <View style={styles.usernameVerified}>
                <Text style={styles.userName}>{authorName}</Text>

                <SealCheckIcon size={16} weight="fill" color={AppColors.checkmark}/>
              </View>
            ) : (
              <Text style={styles.userName}>{authorName}</Text>
            )}
            <Text style={styles.location} numberOfLines={1}>
              {post.location || authorHandle}
            </Text>
          </View>
        </Pressable>

        {ownerCanManage ? (
          <Pressable
            hitSlop={10}
            onPress={() => setShowOwnerActions((value) => !value)}
          >
            <Ionicons
              color={AppColors.text}
              name="ellipsis-horizontal"
              size={20}
            />
          </Pressable>
        ) : (
          <Pressable
            hitSlop={10}
            onPress={() => setShowUsersActions((value) => !value)}
          >
            <Ionicons
              color={AppColors.text}
              name="ellipsis-horizontal"
              size={20}
            />
          </Pressable>
        )}
      </View>

      {/* Hiển thị actions khi bài post này là của người đang đăng nhập*/}
      {ownerCanManage && showOwnerActions ? (
        <Modal transparent animationType="fade">
          <Pressable
            style={styles.modal}
            onPress={() => setShowOwnerActions((value) => !value)}
          >
            <View style={styles.ownerActions}>
              <Pressable
                onPress={() => onEdit?.(post)}
                style={styles.ownerActionButton}
              >
                <Ionicons
                  color={AppColors.text}
                  name="create-outline"
                  size={17}
                />
                <Text style={styles.actionText}>Sửa</Text>
              </Pressable>
              <Pressable
                onPress={handleDelete}
                style={styles.ownerActionButton}
              >
                <Ionicons
                  color={AppColors.accent}
                  name="trash-outline"
                  size={17}
                />
                <Text style={[styles.actionText, styles.deleteText]}>Xóa</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowOwnerActions((value) => !value)}
                style={styles.ownerActionButton}
              >
                <Text style={[styles.actionText]}>Hủy</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      ) : null}

      {/* Hiển thị actions khi bài posts này là của người khác */}
      {showUsersACtions && (
        <Modal transparent animationType="fade">
          <Pressable
            style={styles.modal}
            onPress={() => setShowUsersActions((value) => !value)}
          >
            <View style={styles.ownerActions}>
              <Pressable
                onPress={() => onEdit?.(post)}
                style={styles.ownerActionButton}
              >
                <Text style={styles.actionText}>Lưu bài viết</Text>
              </Pressable>
              <Pressable
                onPress={handleDelete}
                style={styles.ownerActionButton}
              >
                <Text style={[styles.actionText, styles.deleteText]}>
                  Báo cáo
                </Text>
              </Pressable>
              <Pressable style={styles.ownerActionButton}>
                <Text style={[styles.actionText]}>Chia sẽ lên</Text>
              </Pressable>
              <Pressable style={styles.ownerActionButton}>
                <Text style={[styles.actionText]}>Sao chép liên kết</Text>
              </Pressable>
              <Pressable style={styles.ownerActionButton}>
                <Text style={[styles.actionText]}>Đi đến bài viết</Text>
              </Pressable>
              <Pressable style={styles.ownerActionButton}>
                <Text style={[styles.actionText]}>Xem profile</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowUsersActions((value) => !value)}
                style={styles.ownerActionButton}
              >
                <Text style={[styles.actionText]}>Hủy</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}

      {imageUrls.length > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.mediaFrame}
        >
          {imageUrls.map((uri, idx) => (
            <PostImage
              key={uri + String(idx)}
              uri={uri}
              width={mediaWidth}
              maxHeight={mediaWidth * 1.7}
              backgroundColor={fallbackTone.tone}
              onPress={() => {
                setViewerIndex(idx);
                setViewerVisible(true);
              }}
            />
          ))}
        </ScrollView>
      ) : (
        <VisualTile
          accent={fallbackTone.accent}
          height={338}
          label={(post.content || "emlovy").slice(0, 18)}
          tone={fallbackTone.tone}
        />
      )}

      <ImageViewer
        visible={viewerVisible}
        images={imageUrls}
        initialIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
      />

      <View style={styles.actions}>
        <View style={styles.actionGroup}>
          <Pressable
            hitSlop={10}
            onPress={() => onToggleLike?.(post)}
            style={styles.iconButton}
          >
            <View style={styles.likeContainer}>
              <Ionicons
                color={post.liked_by_me ? AppColors.accent : AppColors.text}
                name={post.liked_by_me ? "heart" : "heart-outline"}
                size={24}
              />
              <Text style={styles.likes}>{post.like_count}</Text>
            </View>
          </Pressable>
          <Pressable
            hitSlop={10}
            onPress={() => onOpenComments?.(post)}
            style={styles.iconButton}
          >
            <View style={styles.commentContainer}>
              <Ionicons
                color={AppColors.text}
                name="chatbubble-outline"
                size={22}
              />
              <Text>{post.comment_count}</Text>
            </View>
          </Pressable>
          <Ionicons
            color={AppColors.text}
            name="paper-plane-outline"
            size={22}
          />
        </View>

        <Ionicons color={AppColors.text} name="bookmark-outline" size={22} />
      </View>

      {post.content ? (
        <Text style={styles.caption}>
          <Text style={styles.captionUser}>
            {post.author?.username || authorName}{" "}
          </Text>
          {post.content}
        </Text>
      ) : null}
      <Pressable
        onPress={() => onOpenComments?.(post)}
        style={styles.created_at}
      >
        <Text style={styles.meta}>{formatRelativeTime(post.created_at)}</Text>
      </Pressable>
    </View>
  );
});

PostCard.displayName = "PostCard";

export default PostCard;

const styles = StyleSheet.create({
  actionGroup: {
    alignItems: "center",
    flexDirection: "row",
    gap: 20,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingHorizontal: 10,
  },
  caption: {
    color: AppColors.text,
    fontFamily: AppFonts.body,
    fontSize: 14,
    lineHeight: 21,
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  captionUser: {
    fontFamily: AppFonts.heading,
    fontWeight: "600",
  },
  card: {
    backgroundColor: AppColors.surface,
    // borderRadius: 24,
    overflow: "hidden",
    paddingVertical: 10,
  },
  deleteText: {
    color: AppColors.accent,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 14,
    paddingHorizontal: 10,
  },
  iconButton: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  likeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    justifyContent: "center",
  },
  likes: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 14,
  },
  commentContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  location: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 12,
    maxWidth: 210,
  },
  mediaFrame: {
    // borderRadius: 10,
    overflow: "hidden",
  },
  mediaImage: {
    backgroundColor: AppColors.surfaceMuted,
  },
  created_at: {
    paddingHorizontal: 10,
  },
  meta: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 12,
    paddingTop: 10,
  },
  ownerActionButton: {
    alignItems: "center",
    // backgroundColor: AppColors.surfaceMuted,
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    minHeight: 36,
    paddingVertical: 12,
    justifyContent: "center",
  },
  actionText: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 16,
  },
  modal: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.22)",
    justifyContent: "center",
    alignItems: "center",
  },
  ownerActions: {
    flexDirection: "column",
    gap: 8,
    backgroundColor: "#fff",
    justifyContent: "space-around",
    borderRadius: 12,
    padding: 12,
    minWidth: "70%",
  },
  userMeta: {
    gap: 3,
  },
  userName: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 15,
  },
  userRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  usernameVerified: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
});
