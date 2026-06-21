import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { UserAvatar } from "@/components/user-avatar";
import { AppColors, AppFonts } from "@/constants/theme";
import { postApi, reelApi, resolveMediaUrl } from "@/services/api";
import { subscribeToPostEvents } from "@/services/post-socket";
import { subscribeToReelEvents } from "@/services/reel-socket";
import type { Post, PostComment } from "@/types/auth";

const COMMENT_LIMIT = 20;

type CommentsSheetProps = {
  onClose: () => void;
  onPostCommentCountChange?: (postId: number, commentCount: number) => void;
  post: Post | null;
  kind?: "post" | "reel";
  token?: string | null;
  visible: boolean;
};

type CommentCacheEntry = {
  hasMore: boolean;
  items: PostComment[];
  page: number;
};

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
    return "vua xong";
  }

  if (diffMs < hour) {
    return `${Math.floor(diffMs / minute)} phút`;
  }

  if (diffMs < day) {
    return `${Math.floor(diffMs / hour)} giờ`;
  }

  return `${Math.floor(diffMs / day)} ngày`;
};

const hasCommentInTree = (comments: PostComment[], commentId: number) =>
  comments.some(
    (comment) =>
      comment.id === commentId ||
      comment.replies.some((reply) => reply.id === commentId),
  );

const patchCommentTree = (
  comments: PostComment[],
  commentId: number,
  patch: Partial<
    Pick<PostComment, "like_count" | "liked_by_me" | "reply_count" | "replies">
  >,
) => {
  let didPatch = false;

  const next = comments.map((comment) => {
    if (comment.id === commentId) {
      didPatch = true;
      return { ...comment, ...patch };
    }

    if (!comment.replies.length) {
      return comment;
    }

    let didPatchReply = false;
    const replies = comment.replies.map((reply) => {
      if (reply.id !== commentId) {
        return reply;
      }

      didPatchReply = true;
      return { ...reply, ...patch };
    });

    if (!didPatchReply) {
      return comment;
    }

    didPatch = true;
    return { ...comment, replies };
  });

  return didPatch ? next : comments;
};

const addIncomingComment = (
  comments: PostComment[],
  nextComment: PostComment,
) => {
  if (hasCommentInTree(comments, nextComment.id)) {
    return comments;
  }

  if (!nextComment.parent_id) {
    return [nextComment, ...comments];
  }

  let didAppend = false;
  const next = comments.map((comment) => {
    if (comment.id !== nextComment.parent_id) {
      return comment;
    }

    didAppend = true;
    return {
      ...comment,
      replies: [...comment.replies, nextComment],
      reply_count: comment.reply_count + 1,
    };
  });

  return didAppend ? next : comments;
};

const mergeCommentPage = (current: PostComment[], incoming: PostComment[]) => {
  const seen = new Set(current.map((comment) => comment.id));
  const nextItems = incoming.filter((comment) => {
    if (seen.has(comment.id)) {
      return false;
    }

    seen.add(comment.id);
    return true;
  });

  return nextItems.length ? [...current, ...nextItems] : current;
};

export function CommentsSheet({
  kind = "post",
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
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<PostComment | null>(null);
  const commentsCacheRef = useRef(new Map<string, CommentCacheEntry>());
  const loadRequestRef = useRef(0);
  const postId = post?.post_id || null;
  const cacheKey = postId ? `${kind}:${postId}` : null;

  const canSubmit = useMemo(
    () => input.trim().length > 0 && !isSubmitting,
    [input, isSubmitting],
  );

  const writeCache = useCallback(
    (items: PostComment[], nextPage = page, nextHasMore = hasMore) => {
      if (!cacheKey) {
        return;
      }

      commentsCacheRef.current.set(cacheKey, {
        hasMore: nextHasMore,
        items,
        page: nextPage,
      });
    },
    [cacheKey, hasMore, page],
  );

  const setCommentsWithCache = useCallback(
    (updater: (current: PostComment[]) => PostComment[]) => {
      setComments((current) => {
        const next = updater(current);

        if (next !== current) {
          writeCache(next);
        }

        return next;
      });
    },
    [writeCache],
  );

  const loadComments = useCallback(
    async (nextPage = 1, replace = true, silent = false) => {
      if (!postId || !cacheKey) {
        return;
      }

      const requestId = loadRequestRef.current + 1;
      loadRequestRef.current = requestId;

      if (replace) {
        setIsLoading(!silent);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response =
          kind === "reel"
            ? await reelApi.getComments(postId, {
                limit: COMMENT_LIMIT,
                page: nextPage,
                token,
              })
            : await postApi.getComments(postId, {
                limit: COMMENT_LIMIT,
                page: nextPage,
                sort: "top",
                token,
              });

        if (loadRequestRef.current !== requestId) {
          return;
        }

        const pagination = response.data.pagination;
        setComments((current) => {
          const nextItems = replace
            ? response.data.items
            : mergeCommentPage(current, response.data.items);

          commentsCacheRef.current.set(cacheKey, {
            hasMore: pagination.hasMore,
            items: nextItems,
            page: pagination.page,
          });

          return nextItems;
        });
        setPage(pagination.page);
        setHasMore(pagination.hasMore);
        setError("");
      } catch (loadError) {
        if (loadRequestRef.current === requestId) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Khong the tai binh luan.",
          );
        }
      } finally {
        if (loadRequestRef.current === requestId) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [cacheKey, kind, postId, token],
  );

  useEffect(() => {
    if (!visible || !postId || !cacheKey) {
      loadRequestRef.current += 1;
      setIsLoading(false);
      setIsLoadingMore(false);
      return;
    }

    const cached = commentsCacheRef.current.get(cacheKey);

    setComments(cached?.items || []);
    setPage(cached?.page || 1);
    setHasMore(cached?.hasMore || false);
    setInput("");
    setReplyingTo(null);
    setError("");
    loadComments(1, true, Boolean(cached));
  }, [cacheKey, loadComments, postId, visible]);

  const applyIncomingComment = useCallback(
    (nextComment: PostComment) => {
      setCommentsWithCache((current) =>
        addIncomingComment(current, nextComment),
      );
    },
    [setCommentsWithCache],
  );

  useEffect(() => {
    if (!visible || !postId) {
      return undefined;
    }

    const handleCommented = (payload: {
      post_id: number;
      comment_count: number;
      comment?: PostComment;
    }) => {
      if (!payload || payload.post_id !== postId) {
        return;
      }

      if (payload.comment) {
        applyIncomingComment(payload.comment);
      }

      onPostCommentCountChange?.(postId, payload.comment_count);
    };

    return kind === "reel"
      ? subscribeToReelEvents({ onCommented: handleCommented })
      : subscribeToPostEvents({ onCommented: handleCommented });
  }, [applyIncomingComment, kind, onPostCommentCountChange, postId, visible]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoading || isLoadingMore) {
      return;
    }

    loadComments(page + 1, false);
  }, [hasMore, isLoading, isLoadingMore, loadComments, page]);

  const handleReplyTo = useCallback((comment: PostComment) => {
    setReplyingTo(comment);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!post || !canSubmit) {
      return;
    }

    if (!token) {
      setError("Ban can dang nhap de binh luan.");
      return;
    }

    const content = input.trim();
    const parent = replyingTo;
    setIsSubmitting(true);

    try {
      const response = parent
        ? await postApi.reply(token, post.post_id, parent.id, content)
        : kind === "reel"
          ? await reelApi.comment(token, post.post_id, content)
          : await postApi.comment(token, post.post_id, content);

      const nextComment = response.data.comment;
      setInput("");
      setReplyingTo(null);
      setError("");
      onPostCommentCountChange?.(
        post.post_id,
        response.data.post.comment_count,
      );

      if (nextComment) {
        applyIncomingComment(nextComment);
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Khong the gui binh luan.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    applyIncomingComment,
    canSubmit,
    input,
    kind,
    onPostCommentCountChange,
    post,
    replyingTo,
    token,
  ]);

  const handleToggleCommentLike = useCallback(
    async (comment: PostComment) => {
      if (!token) {
        setError("Ban can dang nhap de tha tym.");
        return;
      }

      const shouldLike = !comment.liked_by_me;
      const optimisticLikeCount = Math.max(
        0,
        comment.like_count + (shouldLike ? 1 : -1),
      );

      setCommentsWithCache((current) =>
        patchCommentTree(current, comment.id, {
          liked_by_me: shouldLike,
          like_count: optimisticLikeCount,
        }),
      );

      try {
        const response = shouldLike
          ? await postApi.likeComment(token, comment.id)
          : await postApi.unlikeComment(token, comment.id);

        setCommentsWithCache((current) =>
          patchCommentTree(current, comment.id, {
            liked_by_me: response.data.liked_by_me,
            like_count: response.data.like_count,
          }),
        );
        setError("");
      } catch (likeError) {
        setCommentsWithCache((current) =>
          patchCommentTree(current, comment.id, {
            liked_by_me: comment.liked_by_me,
            like_count: comment.like_count,
          }),
        );
        setError(
          likeError instanceof Error
            ? likeError.message
            : "Khong the cap nhat tym.",
        );
      }
    },
    [setCommentsWithCache, token],
  );

  const keyExtractor = useCallback((item: PostComment) => String(item.id), []);

  const renderCommentItem = useCallback(
    ({ item }: { item: PostComment }) => (
      <CommentItem
        comment={item}
        onLike={handleToggleCommentLike}
        onReply={handleReplyTo}
      />
    ),
    [handleReplyTo, handleToggleCommentLike],
  );

  const listHeader = useMemo(
    () => (
      <View>
        {/* {post ? <PostMediaPreview post={post} width={width} /> : null} */}
        <View style={styles.sortRow}>
          <View style={styles.sortPill}>
            <Ionicons color={AppColors.accent} name="heart" size={13} />
            <Text style={styles.sortText}>Top comments</Text>
          </View>
          {post ? (
            <Text style={styles.countText}>{post.comment_count} Bình luận</Text>
          ) : null}
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    ),
    [error, post],
  );

  const listEmpty = useMemo(
    () => (
      <Text style={styles.emptyText}>
        Ở đây yên tĩnh quá. Hãy nêu cảm nghĩ của bạn.
      </Text>
    ),
    [],
  );

  const listFooter = useMemo(
    () =>
      isLoadingMore ? (
        <ActivityIndicator
          color={AppColors.accent}
          style={styles.footerLoader}
        />
      ) : null,
    [isLoadingMore],
  );

  const commentListContentStyle = useMemo(
    () => [
      styles.commentList,
      comments.length === 0 ? styles.commentListEmpty : null,
    ],
    [comments.length],
  );

  const sheetStyle = useMemo(
    () => [
      styles.sheet,
      {
        paddingBottom: Math.max(insets.bottom, 12),
      },
    ],
    [insets.bottom],
  );

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
      presentationStyle="overFullScreen"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFillObject} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={sheetStyle}
        >
          <View style={styles.grabber} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Bình luận</Text>
            <Pressable
              hitSlop={10}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons color={AppColors.text} name="close" size={22} />
            </Pressable>
          </View>

          {isLoading ? (
            <ActivityIndicator color={AppColors.accent} style={styles.loader} />
          ) : (
            <FlatList
              ListEmptyComponent={listEmpty}
              ListFooterComponent={listFooter}
              ListHeaderComponent={listHeader}
              contentContainerStyle={commentListContentStyle}
              data={comments}
              initialNumToRender={8}
              keyExtractor={keyExtractor}
              keyboardShouldPersistTaps="handled"
              maxToRenderPerBatch={8}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.35}
              removeClippedSubviews={Platform.OS === "android"}
              renderItem={renderCommentItem}
              showsVerticalScrollIndicator={false}
              updateCellsBatchingPeriod={70}
              windowSize={7}
            />
          )}

          {replyingTo ? (
            <View style={styles.replyBanner}>
              <Text numberOfLines={1} style={styles.replyBannerText}>
                Đang trả lời @{replyingTo.author?.username || "emlovy"}
              </Text>
              <Pressable hitSlop={8} onPress={() => setReplyingTo(null)}>
                <Ionicons
                  color={AppColors.muted}
                  name="close-circle"
                  size={18}
                />
              </Pressable>
            </View>
          ) : null}

          <View style={styles.inputRow}>
            <TextInput
              maxLength={1000}
              multiline
              onChangeText={setInput}
              placeholder={
                replyingTo ? "Viet phan hoi..." : "Viet binh luan..."
              }
              placeholderTextColor={AppColors.muted}
              style={styles.input}
              value={input}
            />
            <Pressable
              disabled={!canSubmit}
              onPress={handleSubmit}
              style={[
                styles.sendButton,
                !canSubmit ? styles.sendButtonDisabled : null,
              ]}
            >
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

const CommentItem = memo(function CommentItem({
  comment,
  isReply = false,
  onLike,
  onReply,
  rootComment,
}: {
  comment: PostComment;
  isReply?: boolean;
  onLike: (comment: PostComment) => void;
  onReply: (comment: PostComment) => void;
  rootComment?: PostComment;
}) {
  const replyTarget = rootComment || comment;
  const authorName = comment.author?.name || "Emlovy User";
  const handle = comment.author?.username
    ? `@${comment.author.username}`
    : "@emlovy";
  const avatarUrl = resolveMediaUrl(
    comment.author?.avatar_url || comment.author?.avata,
  );
  const createdAt = useMemo(
    () => formatRelativeTime(comment.created_at),
    [comment.created_at],
  );
  const handleLike = useCallback(() => onLike(comment), [comment, onLike]);
  const handleReply = useCallback(
    () => onReply(replyTarget),
    [onReply, replyTarget],
  );

  return (
    <View style={[styles.commentRow, isReply ? styles.replyRow : null]}>
      <UserAvatar
        imageUrl={avatarUrl}
        name={authorName}
        size={isReply ? 34 : 42}
      />
      <View style={styles.commentBody}>
        <View style={styles.commentBubble}>
          <View style={styles.commentMetaRow}>
            <Text numberOfLines={1} style={styles.commentAuthor}>
              {handle}
            </Text>
            <Text style={styles.commentTime}>{createdAt}</Text>
          </View>
          <Text style={styles.commentText}>{comment.content}</Text>
        </View>

        <View style={styles.commentActions}>
          <Pressable onPress={handleLike} style={styles.commentAction}>
            <Ionicons
              color={comment.liked_by_me ? AppColors.accent : AppColors.muted}
              name={comment.liked_by_me ? "heart" : "heart-outline"}
              size={15}
            />
            <Text style={styles.commentActionText}>{comment.like_count}</Text>
          </Pressable>
          <Pressable onPress={handleReply} style={styles.commentAction}>
            <Text style={styles.commentActionText}>Trả lời</Text>
          </Pressable>
        </View>

        {!isReply && comment.replies.length > 0 ? (
          <View style={styles.replies}>
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isReply
                onLike={onLike}
                onReply={onReply}
                rootComment={comment}
              />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
});

CommentItem.displayName = "CommentItem";

const styles = StyleSheet.create({
  closeButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  commentAction: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    minHeight: 26,
  },
  commentActionText: {
    color: AppColors.muted,
    fontFamily: AppFonts.heading,
    fontSize: 12,
  },
  commentActions: {
    alignItems: "center",
    flexDirection: "row",
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
    backgroundColor: AppColors.commentBubble,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  commentList: {
    gap: 14,
    paddingBottom: 10,
    paddingHorizontal: 18,
  },
  commentListEmpty: {
    flexGrow: 1,
  },
  commentMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  commentRow: {
    alignItems: "flex-start",
    flexDirection: "row",
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
    textAlign: "center",
  },
  errorText: {
    color: AppColors.accent,
    fontFamily: AppFonts.body,
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: 2,
    paddingTop: 8,
  },
  footerLoader: {
    paddingVertical: 18,
  },
  grabber: {
    alignSelf: "center",
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
    alignItems: "flex-end",
    borderColor: AppColors.border,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    marginHorizontal: 18,
    marginTop: 10,
    paddingRight: 4,
  },
  loader: {
    flex: 1,
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.28)",
    flex: 1,
    justifyContent: "flex-end",
  },
  replies: {
    gap: 12,
    paddingTop: 12,
  },
  replyBanner: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
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
    alignItems: "center",
    backgroundColor: '#000',
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
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
    maxHeight: "92%",
    minHeight: "55%",
  },
  sheetHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  sheetTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 18,
  },
  sortPill: {
    alignItems: "center",
    backgroundColor: AppColors.accentSoft,
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sortRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  sortText: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 12,
  },
  videoPreview: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "#111111",
    justifyContent: "center",
  },
});
