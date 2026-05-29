import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UserAvatar } from '@/components/user-avatar';
import { AppColors, AppFonts } from '@/constants/theme';
import { postApi, reelApi, resolveMediaUrl } from '@/services/api';
import type { Post, PostComment } from '@/types/auth';

const COMMENT_LIMIT = 20;

type CommentsSheetProps = {
  onClose: () => void;
  onPostCommentCountChange?: (postId: number, commentCount: number) => void;
  post: Post | null;
  kind?: 'post' | 'reel';
  token?: string | null;
  visible: boolean;
};

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
    return `${Math.floor(diffMs / minute)} phut`;
  }

  if (diffMs < day) {
    return `${Math.floor(diffMs / hour)} gio`;
  }

  return `${Math.floor(diffMs / day)} ngay`;
};

const patchCommentTree = (
  comments: PostComment[],
  commentId: number,
  patch: Partial<Pick<PostComment, 'like_count' | 'liked_by_me' | 'reply_count' | 'replies'>>,
) =>
  comments.map((comment) => {
    if (comment.id === commentId) {
      return { ...comment, ...patch };
    }

    return {
      ...comment,
      replies: comment.replies.map((reply) => (reply.id === commentId ? { ...reply, ...patch } : reply)),
    };
  });

const appendReply = (comments: PostComment[], reply: PostComment) =>
  comments.map((comment) => {
    if (comment.id !== reply.parent_id) {
      return comment;
    }

    return {
      ...comment,
      reply_count: comment.reply_count + 1,
      replies: [...comment.replies, reply],
    };
  });

export function CommentsSheet({
  kind = 'post',
  onClose,
  onPostCommentCountChange,
  post,
  token,
  visible,
}: CommentsSheetProps) {
  const insets = useSafeAreaInsets();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [input, setInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<PostComment | null>(null);
  const postId = post?.post_id || null;

  const canSubmit = useMemo(() => input.trim().length > 0 && !isSubmitting, [input, isSubmitting]);

  const loadComments = useCallback(
    async (nextPage = 1, replace = true) => {
      if (!postId) {
        return;
      }

      if (replace) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response =
          kind === 'reel'
            ? await reelApi.getComments(postId, {
                limit: COMMENT_LIMIT,
                page: nextPage,
                token,
              })
            : await postApi.getComments(postId, {
                limit: COMMENT_LIMIT,
                page: nextPage,
                sort: 'top',
                token,
              });

        setComments((current) => (replace ? response.data.items : [...current, ...response.data.items]));
        setPage(response.data.pagination.page);
        setHasMore(response.data.pagination.hasMore);
        setError('');
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Khong the tai binh luan.');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [kind, postId, token],
  );

  useEffect(() => {
    if (visible && postId) {
      setComments([]);
      setInput('');
      setReplyingTo(null);
      loadComments(1, true);
    }
  }, [loadComments, postId, visible]);

  const handleLoadMore = () => {
    if (!hasMore || isLoading || isLoadingMore) {
      return;
    }

    loadComments(page + 1, false);
  };

  const handleSubmit = async () => {
    if (!post || !canSubmit) {
      return;
    }

    if (!token) {
      setError('Ban can dang nhap de binh luan.');
      return;
    }

    const content = input.trim();
    const parent = replyingTo;
    setIsSubmitting(true);

    try {
      const response = parent
        ? await postApi.reply(token, post.post_id, parent.id, content)
        : kind === 'reel'
          ? await reelApi.comment(token, post.post_id, content)
          : await postApi.comment(token, post.post_id, content);

      const nextComment = response.data.comment;
      setInput('');
      setReplyingTo(null);
      setError('');
      onPostCommentCountChange?.(post.post_id, response.data.post.comment_count);

      if (nextComment.parent_id) {
        setComments((current) => appendReply(current, nextComment));
      } else {
        setComments((current) => [nextComment, ...current]);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Khong the gui binh luan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleCommentLike = async (comment: PostComment) => {
    if (!token) {
      setError('Ban can dang nhap de tha tym.');
      return;
    }

    const shouldLike = !comment.liked_by_me;
    const optimisticLikeCount = Math.max(0, comment.like_count + (shouldLike ? 1 : -1));

    setComments((current) =>
      patchCommentTree(current, comment.id, {
        liked_by_me: shouldLike,
        like_count: optimisticLikeCount,
      }),
    );

    try {
      const response = shouldLike
        ? await postApi.likeComment(token, comment.id)
        : await postApi.unlikeComment(token, comment.id);

      setComments((current) =>
        patchCommentTree(current, comment.id, {
          liked_by_me: response.data.liked_by_me,
          like_count: response.data.like_count,
        }),
      );
      setError('');
    } catch (likeError) {
      setComments((current) =>
        patchCommentTree(current, comment.id, {
          liked_by_me: comment.liked_by_me,
          like_count: comment.like_count,
        }),
      );
      setError(likeError instanceof Error ? likeError.message : 'Khong the cap nhat tym.');
    }
  };

  const renderComment = (comment: PostComment, isReply = false, rootComment: PostComment = comment) => {
    const authorName = comment.author?.name || 'Emlovy User';
    const handle = comment.author?.username ? `@${comment.author.username}` : '@emlovy';
    const avatarUrl = resolveMediaUrl(comment.author?.avatar_url || comment.author?.avata);

    return (
      <View key={comment.id} style={[styles.commentRow, isReply ? styles.replyRow : null]}>
        <UserAvatar imageUrl={avatarUrl} name={authorName} size={isReply ? 34 : 42} />
        <View style={styles.commentBody}>
          <View style={styles.commentBubble}>
            <View style={styles.commentMetaRow}>
              <Text numberOfLines={1} style={styles.commentAuthor}>
                {handle}
              </Text>
              <Text style={styles.commentTime}>{formatRelativeTime(comment.created_at)}</Text>
            </View>
            <Text style={styles.commentText}>{comment.content}</Text>
          </View>

          <View style={styles.commentActions}>
            <Pressable onPress={() => handleToggleCommentLike(comment)} style={styles.commentAction}>
              <Ionicons
                color={comment.liked_by_me ? AppColors.accent : AppColors.muted}
                name={comment.liked_by_me ? 'heart' : 'heart-outline'}
                size={15}
              />
              <Text style={styles.commentActionText}>{comment.like_count}</Text>
            </Pressable>
            <Pressable onPress={() => setReplyingTo(rootComment)} style={styles.commentAction}>
              <Text style={styles.commentActionText}>Trả lời</Text>
            </Pressable>
          </View>

          {!isReply && comment.replies.length > 0 ? (
            <View style={styles.replies}>
              {comment.replies.map((reply) => renderComment(reply, true, comment))}
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFillObject} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.grabber} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Binh luan</Text>
            <Pressable hitSlop={10} onPress={onClose} style={styles.closeButton}>
              <Ionicons color={AppColors.text} name="close" size={22} />
            </Pressable>
          </View>

          <View style={styles.sortRow}>
            <View style={styles.sortPill}>
              <Ionicons color={AppColors.accent} name="heart" size={13} />
              <Text style={styles.sortText}>Top comments</Text>
            </View>
            {post ? <Text style={styles.countText}>{post.comment_count} bình luận</Text> : null}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {isLoading ? (
            <ActivityIndicator color={AppColors.accent} style={styles.loader} />
          ) : (
            <FlatList
              ListEmptyComponent={<Text style={styles.emptyText}>Hãy trở thành người bình luận đầu tiên.</Text>}
              ListFooterComponent={
                isLoadingMore ? <ActivityIndicator color={AppColors.accent} style={styles.footerLoader} /> : null
              }
              contentContainerStyle={styles.commentList}
              data={comments}
              keyExtractor={(item) => String(item.id)}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.35}
              renderItem={({ item }) => renderComment(item)}
              showsVerticalScrollIndicator={false}
            />
          )}

          {replyingTo ? (
            <View style={styles.replyBanner}>
              <Text numberOfLines={1} style={styles.replyBannerText}>
                Đang trả lời @{replyingTo.author?.username || 'emlovy'}
              </Text>
              <Pressable hitSlop={8} onPress={() => setReplyingTo(null)}>
                <Ionicons color={AppColors.muted} name="close-circle" size={18} />
              </Pressable>
            </View>
          ) : null}

          <View style={styles.inputRow}>
            <TextInput
              maxLength={1000}
              multiline
              onChangeText={setInput}
              placeholder={replyingTo ? 'Viết phản hồi...' : 'Viết bình luận...'}
              placeholderTextColor={AppColors.muted}
              style={styles.input}
              value={input}
            />
            <Pressable
              disabled={!canSubmit}
              onPress={handleSubmit}
              style={[styles.sendButton, !canSubmit ? styles.sendButtonDisabled : null]}>
              {isSubmitting ? (
                <ActivityIndicator color={AppColors.surface} size="small" />
              ) : (
                <Ionicons color={AppColors.surface} name="send" size={18} />
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  commentAction: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    minHeight: 26,
  },
  commentActionText: {
    color: AppColors.muted,
    fontFamily: AppFonts.heading,
    fontSize: 12,
  },
  commentActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    paddingLeft: 8,
    paddingTop: 6,
  },
  commentAuthor: {
    color: AppColors.text,
    flex: 1,
    fontFamily: AppFonts.heading,
    fontSize: 13,
  },
  commentBody: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: AppColors.surfaceMuted,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  commentList: {
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  commentMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  commentRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  commentText: {
    color: AppColors.text,
    fontFamily: AppFonts.body,
    fontSize: 14,
    lineHeight: 20,
    paddingTop: 4,
  },
  commentTime: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 11,
  },
  countText: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 12,
  },
  emptyText: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 14,
    paddingVertical: 28,
    textAlign: 'center',
  },
  errorText: {
    color: AppColors.accent,
    fontFamily: AppFonts.body,
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  footerLoader: {
    paddingVertical: 18,
  },
  grabber: {
    alignSelf: 'center',
    backgroundColor: AppColors.border,
    borderRadius: 999,
    height: 4,
    marginTop: 10,
    width: 42,
  },
  input: {
    color: AppColors.text,
    flex: 1,
    fontFamily: AppFonts.body,
    fontSize: 14,
    maxHeight: 92,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputRow: {
    alignItems: 'flex-end',
    backgroundColor: AppColors.surfaceMuted,
    borderColor: AppColors.border,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    marginHorizontal: 18,
    marginTop: 10,
    paddingRight: 4,
  },
  loader: {
    flex: 1,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  replies: {
    gap: 12,
    paddingTop: 12,
  },
  replyBanner: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 6,
  },
  replyBannerText: {
    color: AppColors.muted,
    flex: 1,
    fontFamily: AppFonts.body,
    fontSize: 12,
  },
  replyRow: {
    paddingLeft: 4,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: AppColors.accent,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    marginBottom: 4,
    width: 36,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  sheet: {
    backgroundColor: AppColors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '86%',
    minHeight: '58%',
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  sheetTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 18,
  },
  sortPill: {
    alignItems: 'center',
    backgroundColor: AppColors.accentSoft,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sortRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 6,
  },
  sortText: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 12,
  },
});
