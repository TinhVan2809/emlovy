import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { UserAvatar } from '@/components/user-avatar';
import { VisualTile } from '@/components/visual-tile';
import { AppColors, AppFonts } from '@/constants/theme';
import { resolveMediaUrl } from '@/services/api';
import type { Post } from '@/types/auth';

type PostCardProps = {
  currentUserId?: number | null;
  onDelete?: (post: Post) => void;
  onEdit?: (post: Post) => void;
  onOpenAuthor?: (post: Post) => void;
  onOpenComments?: (post: Post) => void;
  onToggleLike?: (post: Post) => void;
  post: Post;
};

const palette = [
  { accent: '#FF7A59', tone: '#FFE1D6' },
  { accent: '#46B07D', tone: '#D9EFE1' },
  { accent: '#5B86FF', tone: '#DDE7FF' },
  { accent: '#D56AE0', tone: '#F5DCF9' },
];

const formatRelativeTime = (value: string) => {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();

  if (!Number.isFinite(diffMs)) {
    return '';
  }

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) {
    return 'vua xong';
  }

  if (diffMs < hour) {
    return `${Math.floor(diffMs / minute)} phút trước`;
  }

  if (diffMs < day) {
    return `${Math.floor(diffMs / hour)} giò trước`;
  }

  return `${Math.floor(diffMs / day)} ngày trước`;
};

export function PostCard({
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
  const ownerCanManage = Number(currentUserId) === Number(post.user_id);
  const mediaWidth = Math.max(260, Math.min(width - 68, 520));
  const fallbackTone = palette[post.post_id % palette.length];
  const authorName = post.author?.name || 'Emlovy User';
  const authorHandle = post.author?.username ? `@${post.author.username}` : '@emlovy';
  const avatarUrl = resolveMediaUrl(post.author?.avatar_url || post.author?.avata);

  const imageUrls = useMemo(
    () =>
      post.media
        .filter((item) => item.type === 'image')
        .map((item) => resolveMediaUrl(item.media_url))
        .filter(Boolean) as string[],
    [post.media],
  );

  const handleDelete = () => {
    Alert.alert('Xóa bài viết', 'Bạn chắc chắn muốn xóa bài viết này?', [
      { style: 'cancel', text: ' Hủy' },
      {
        onPress: () => onDelete?.(post),
        style: 'destructive',
        text: 'Xóa',
      },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable
          disabled={!onOpenAuthor}
          onPress={() => onOpenAuthor?.(post)}
          style={styles.userRow}>
          <UserAvatar imageUrl={avatarUrl} name={authorName} size={48} />

          <View style={styles.userMeta}>
            <Text style={styles.userName}>{authorName}</Text>
            <Text style={styles.location} numberOfLines={1}>
              {post.location || authorHandle}
            </Text>
          </View>
        </Pressable>

        {ownerCanManage ? (
          <Pressable hitSlop={10} onPress={() => setShowOwnerActions((value) => !value)}>
            <Ionicons color={AppColors.text} name="ellipsis-horizontal" size={20} />
          </Pressable>
        ) : (
          <Ionicons color={AppColors.text} name="ellipsis-horizontal" size={20} />
        )}
      </View>

      {ownerCanManage && showOwnerActions ? (
        <View style={styles.ownerActions}>
          <Pressable onPress={() => onEdit?.(post)} style={styles.ownerActionButton}>
            <Ionicons color={AppColors.text} name="create-outline" size={17} />
            <Text style={styles.ownerActionText}>Sua</Text>
          </Pressable>
          <Pressable onPress={handleDelete} style={styles.ownerActionButton}>
            <Ionicons color={AppColors.accent} name="trash-outline" size={17} />
            <Text style={[styles.ownerActionText, styles.deleteText]}>Xoa</Text>
          </Pressable>
        </View>
      ) : null}

      {imageUrls.length > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.mediaFrame}>
          {imageUrls.map((uri) => (
            <Image
              key={uri}
              contentFit="cover"
              source={{ uri }}
              style={[styles.mediaImage, { height: mediaWidth * 1.5, width: mediaWidth }]}
            />
          ))}
        </ScrollView>
      ) : (
        <VisualTile
          accent={fallbackTone.accent}
          height={338}
          label={(post.content || 'emlovy').slice(0, 18)}
          tone={fallbackTone.tone}
        />
      )}

      <View style={styles.actions}>
        <View style={styles.actionGroup}>
          <Pressable hitSlop={10} onPress={() => onToggleLike?.(post)} style={styles.iconButton}>
            <Ionicons
              color={post.liked_by_me ? AppColors.accent : AppColors.text}
              name={post.liked_by_me ? 'heart' : 'heart-outline'}
              size={24}
            />
          </Pressable>
          <Pressable hitSlop={10} onPress={() => onOpenComments?.(post)} style={styles.iconButton}>
            <Ionicons color={AppColors.text} name="chatbubble-outline" size={22} />
          </Pressable>
          <Ionicons color={AppColors.text} name="paper-plane-outline" size={22} />
        </View>

        <Ionicons color={AppColors.text} name="bookmark-outline" size={22} />
      </View>

      <Text style={styles.likes}>{post.like_count} likes</Text>
      {post.content ? (
        <Text style={styles.caption}>
          <Text style={styles.captionUser}>{post.author?.username || authorName} </Text>
          {post.content}
        </Text>
      ) : null}
      <Pressable onPress={() => onOpenComments?.(post)}>
        <Text style={styles.meta}>
        {post.comment_count} bình luận - {formatRelativeTime(post.created_at)}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actionGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  caption: {
    color: AppColors.text,
    fontFamily: AppFonts.body,
    fontSize: 14,
    lineHeight: 21,
    paddingTop: 10,
  },
  captionUser: {
    fontFamily: AppFonts.heading,
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: 24,
    elevation: 4,
    overflow: 'hidden',
    padding: 16,
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  deleteText: {
    color: AppColors.accent,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 14,
  },
  iconButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  likes: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 14,
    paddingTop: 14,
  },
  location: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 12,
    maxWidth: 210,
  },
  mediaFrame: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  mediaImage: {
    backgroundColor: AppColors.surfaceMuted,
  },
  meta: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 12,
    paddingTop: 10,
  },
  ownerActionButton: {
    alignItems: 'center',
    backgroundColor: AppColors.surfaceMuted,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 12,
  },
  ownerActionText: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 13,
  },
  ownerActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    paddingBottom: 12,
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
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
});
