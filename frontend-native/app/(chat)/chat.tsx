import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from "react-native";

import { ScreenShell } from "@/components/screen-shell";
import { UserAvatar } from "@/components/user-avatar";
import { AppColors, AppFonts } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useUnreadMessages } from "@/contexts/unread-messages-context";
import { chatApi, resolveMediaUrl } from "@/services/api";
import { chatRoute } from "@/constants/routes";
import {
  joinChatConversation,
  leaveChatConversation,
  sendRealtimeMessage,
  subscribeToChatEvents,
} from "@/services/chat-socket";
import type {
  ChatConversation,
  ChatMessage,
  PostsPagination,
} from "@/types/auth";

const CONVERSATION_LIMIT = 20;
const MESSAGE_LIMIT = 30;

const sortConversations = (items: ChatConversation[]) =>
  [...items].sort((first, second) => {
    const firstTime = Date.parse(
      first.last_message_at || first.updated_at || first.created_at,
    );
    const secondTime = Date.parse(
      second.last_message_at || second.updated_at || second.created_at,
    );

    return secondTime - firstTime;
  });

const upsertConversation = (
  current: ChatConversation[],
  incoming: ChatConversation,
) => {
  const exists = current.some(
    (conversation) => conversation.conversation_id === incoming.conversation_id,
  );
  const next = exists
    ? current.map((conversation) =>
        conversation.conversation_id === incoming.conversation_id
          ? incoming
          : conversation,
      )
    : [incoming, ...current];

  return sortConversations(next);
};

const touchConversationWithMessage = (
  conversation: ChatConversation,
  message: ChatMessage,
): ChatConversation => ({
  ...conversation,
  last_message: message,
  last_message_at: message.created_at,
  last_message_id: message.message_id,
  updated_at: message.updated_at || conversation.updated_at,
});

const mergeMessages = (
  current: ChatMessage[],
  incoming: ChatMessage[],
  position: "append" | "prepend",
) => {
  const safeIncoming = incoming.filter((message): message is ChatMessage =>
    Boolean(message?.message_id),
  );
  const combined =
    position === "prepend"
      ? [...safeIncoming, ...current]
      : [...current, ...safeIncoming];
  const seen = new Set<number>();

  return combined.filter((message) => {
    if (seen.has(message.message_id)) {
      return false;
    }

    seen.add(message.message_id);
    return true;
  });
};

const formatConversationTime = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

const getPreviewText = (conversation: ChatConversation) => {
  const lastMessage = conversation.last_message;

  if (!lastMessage) {
    return "Bắt đầu cuộc trò chuyện";
  }

  if (lastMessage.message_type !== "text") {
    return "Đã gửi một tệp đính kèm";
  }

  return lastMessage.content || "Tin nhắn mới";
};

export default function ChatScreen() {
  const { token, user } = useAuth();
  const { refreshUnreadCount } = useUnreadMessages();
  const params = useLocalSearchParams();
  const rawUserId = Array.isArray(params.userId)
    ? params.userId[0]
    : params.userId;
  const directUserId = Number(rawUserId);
  const validDirectUserId =
    Number.isInteger(directUserId) && directUserId > 0 ? directUserId : null;
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [conversationPagination, setConversationPagination] =
    useState<PostsPagination | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagePagination, setMessagePagination] =
    useState<PostsPagination | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [composerText, setComposerText] = useState("");
  const [error, setError] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isRefreshingConversations, setIsRefreshingConversations] =
    useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [isOpeningDirect, setIsOpeningDirect] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const handledDirectUserRef = useRef<number | null>(null);
  const messageListRef = useRef<FlatList<ChatMessage>>(null);
  const conversationsRef = useRef<ChatConversation[]>([]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const loadConversations = useCallback(
    async (page = 1, replace = true) => {
      if (!token) {
        return;
      }

      if (replace) {
        setIsLoadingConversations(true);
      }

      try {
        const response = await chatApi.getConversations(token, {
          limit: CONVERSATION_LIMIT,
          page,
        });
        setConversationPagination(response.data.pagination);
        setConversations((current) =>
          replace
            ? response.data.items
            : sortConversations([...current, ...response.data.items]),
        );
        setError("");
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Không thể tải hội thoại.",
        );
      } finally {
        setIsLoadingConversations(false);
        setIsRefreshingConversations(false);
      }
    },
    [token],
  );

  const loadMessages = useCallback(
    async (conversationId: number, page = 1, replace = true) => {
      if (!token) {
        return;
      }

      if (replace) {
        setIsLoadingMessages(true);
      } else {
        setIsLoadingOlderMessages(true);
      }

      try {
        const response = await chatApi.getMessages(token, conversationId, {
          limit: MESSAGE_LIMIT,
          page,
        });
        setMessagePagination(response.data.pagination);
        const nextMessages = response.data.items.filter((message) =>
          Boolean(message?.message_id),
        );
        setMessages((current) =>
          replace
            ? nextMessages
            : mergeMessages(current, nextMessages, "prepend"),
        );
        setError("");
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Không thể tải tin nhắn.",
        );
      } finally {
        setIsLoadingMessages(false);
        setIsLoadingOlderMessages(false);
      }
    },
    [token],
  );

  const openConversation = useCallback(
    (conversation: ChatConversation) => {
      setSelectedConversation(conversation);
      setMessages([]);
      setMessagePagination(null);
      loadMessages(conversation.conversation_id, 1, true);
      // Refresh unread count after opening a conversation
      refreshUnreadCount();
    },
    [loadMessages, refreshUnreadCount],
  );

  useEffect(() => {
    loadConversations(1, true);
  }, [loadConversations]);

  // Refresh unread count when chat screen is opened
  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (
      !token ||
      !validDirectUserId ||
      handledDirectUserRef.current === validDirectUserId
    ) {
      return;
    }

    handledDirectUserRef.current = validDirectUserId;
    let isMounted = true;

    const openDirectConversation = async () => {
      setIsOpeningDirect(true);

      try {
        const response = await chatApi.createConversation(token, {
          participant_ids: [validDirectUserId],
          type: "private",
        });

        if (!isMounted) {
          return;
        }

        setConversations((current) =>
          upsertConversation(current, response.data.conversation),
        );
        openConversation(response.data.conversation);
        setError("");
      } catch (openError) {
        if (isMounted) {
          setError(
            openError instanceof Error
              ? openError.message
              : "Không thể mở hội thoại.",
          );
        }
      } finally {
        if (isMounted) {
          setIsOpeningDirect(false);
        }
      }
    };

    openDirectConversation();

    return () => {
      isMounted = false;
    };
  }, [openConversation, token, validDirectUserId]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    return subscribeToChatEvents(token, {
      onError: (payload) =>
        setError(payload.message || "Realtime chat bị gián đoạn."),
      onReceiveMessage: ({ message }) => {
        const conversationExists = conversationsRef.current.some(
          (conversation) =>
            conversation.conversation_id === message.conversation_id,
        );

        setConversations((current) => {
          if (!conversationExists) {
            return current;
          }

          return sortConversations(
            current.map((conversation) =>
              conversation.conversation_id === message.conversation_id
                ? touchConversationWithMessage(conversation, message)
                : conversation,
            ),
          );
        });

        if (!conversationExists) {
          loadConversations(1, true);
        }

        setSelectedConversation((current) =>
          current?.conversation_id === message.conversation_id
            ? touchConversationWithMessage(current, message)
            : current,
        );

        if (selectedConversation?.conversation_id === message.conversation_id) {
          setMessages((current) => mergeMessages(current, [message], "append"));
        }
      },
    });
  }, [loadConversations, selectedConversation?.conversation_id, token]);

  useEffect(() => {
    if (!token || !selectedConversation?.conversation_id) {
      return undefined;
    }

    joinChatConversation(token, selectedConversation.conversation_id);

    return () => {
      leaveChatConversation(token, selectedConversation.conversation_id);
    };
  }, [selectedConversation?.conversation_id, token]);

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const title = conversation.title.toLowerCase();
      const preview = getPreviewText(conversation).toLowerCase();

      return title.includes(query) || preview.includes(query);
    });
  }, [conversations, searchQuery]);

  const handleRefreshConversations = () => {
    setIsRefreshingConversations(true);
    loadConversations(1, true);
  };

  const handleLoadMoreConversations = () => {
    if (!conversationPagination?.hasMore || isLoadingConversations) {
      return;
    }

    loadConversations(conversationPagination.page + 1, false);
  };

  const handleLoadOlderMessages = () => {
    if (
      !selectedConversation ||
      !messagePagination?.hasMore ||
      isLoadingOlderMessages
    ) {
      return;
    }

    loadMessages(
      selectedConversation.conversation_id,
      messagePagination.page + 1,
      false,
    );
  };

  const handleCloseThread = () => {
    setSelectedConversation(null);
    setMessages([]);
    setMessagePagination(null);
  };

  const handleSendMessage = () => {
    if (!token || !selectedConversation || isSending) {
      return;
    }

    const content = composerText.trim();

    if (!content) {
      return;
    }

    setComposerText("");
    setIsSending(true);

    sendRealtimeMessage(
      token,
      selectedConversation.conversation_id,
      { content },
      (payload) => {
        setIsSending(false);

        if (!payload.success || !payload.data) {
          setComposerText(content);
          setError(payload.message || "Không thể gửi tin nhắn.");
          return;
        }

        setMessages((current) =>
          mergeMessages(current, [payload.data!.message], "append"),
        );
        setSelectedConversation((current) =>
          current?.conversation_id ===
          payload.data!.conversation.conversation_id
            ? touchConversationWithMessage(
                payload.data!.conversation,
                payload.data!.message,
              )
            : current,
        );
        setConversations((current) =>
          upsertConversation(
            current,
            touchConversationWithMessage(
              payload.data!.conversation,
              payload.data!.message,
            ),
          ),
        );
        setError("");
      },
    );
  };

  if (selectedConversation) {
    return (
      <ScreenShell
        left={
          <View style={styles.threadHeader}>
            <Pressable
              hitSlop={10}
              onPress={handleCloseThread}
              style={styles.headerIconButton}
            >
              <Ionicons color={AppColors.text} name="arrow-back" size={23} />
            </Pressable>
            <UserAvatar
              imageUrl={resolveMediaUrl(selectedConversation.avatar_url)}
              name={selectedConversation.title}
              size={42}
            />
            <View style={styles.threadTitleBlock}>
              <Text numberOfLines={1} style={styles.threadTitle}>
                {selectedConversation.title}
              </Text>
              <Text style={styles.threadSubtitle}>Đang hoạt động</Text>
            </View>
          </View>
        }
        right={
          <View style={styles.threadActions}>
            <Ionicons color={AppColors.text} name="call-outline" size={22} />
            <Ionicons
              color={AppColors.text}
              name="videocam-outline"
              size={23}
            />
          </View>
        }
      >
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", default: "height" })}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
          style={styles.threadContainer}
        >
          <FlatList
            ref={messageListRef}
            ListEmptyComponent={
              isLoadingMessages ? (
                <ActivityIndicator
                  color={AppColors.accent}
                  style={styles.emptyLoader}
                />
              ) : (
                <Text style={styles.emptyText}>Hãy gửi lời chào đầu tiên.</Text>
              )
            }
            ListHeaderComponent={
              messagePagination?.hasMore ? (
                <Pressable
                  onPress={handleLoadOlderMessages}
                  style={styles.olderButton}
                >
                  {isLoadingOlderMessages ? (
                    <ActivityIndicator color={AppColors.accent} size="small" />
                  ) : (
                    <Text style={styles.olderButtonText}>Tải tin cũ hơn</Text>
                  )}
                </Pressable>
              ) : null
            }
            contentContainerStyle={styles.messagesContent}
            data={messages}
            keyExtractor={(item) => String(item.message_id)}
            onContentSizeChange={() => {
              if (!messagePagination?.hasMore) {
                messageListRef.current?.scrollToEnd({ animated: true });
              }
            }}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                mine={Number(item.sender_id) === Number(user?.user_id)}
              />
            )}
            showsVerticalScrollIndicator={false}
          />

          {error ? <Text style={styles.threadError}>{error}</Text> : null}

          <View style={styles.composerBar}>
            <Pressable style={styles.composerTool}>
              <Ionicons color={AppColors.accent} name="add" size={22} />
            </Pressable>
            <TextInput
              multiline
              onChangeText={setComposerText}
              onSubmitEditing={
                Platform.OS === "ios" ? undefined : handleSendMessage
              }
              placeholder="Nhắn tin..."
              placeholderTextColor={AppColors.tabInactive}
              style={styles.composerInput}
              value={composerText}
            />
            <Pressable
              disabled={!composerText.trim() || isSending}
              onPress={handleSendMessage}
              style={[
                styles.sendButton,
                !composerText.trim() || isSending
                  ? styles.sendButtonDisabled
                  : null,
              ]}
            >
              {isSending ? (
                <ActivityIndicator color={AppColors.surface} size="small" />
              ) : (
                <Ionicons color={AppColors.surface} name="send" size={18} />
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      left={
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => router.back()}
            style={styles.headerIconButton}
          >
            <Ionicons color={AppColors.text} name="arrow-back" size={23} />
          </Pressable>
          <Text style={styles.screenTitle}>Chats</Text>
        </View>
      }
      right={
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push(chatRoute.ai)}
            style={styles.chatAI}
          >
            <Image
              source={require("../../assets/images/icon-ai.png")}
              style={styles.chatAIImg}
            />
          </Pressable>
          <Ionicons color={AppColors.text} name="create-outline" size={24} />
        </View>
      }
    >
      <FlatList
        ListEmptyComponent={
          isLoadingConversations || isOpeningDirect ? (
            <ActivityIndicator
              color={AppColors.accent}
              style={styles.emptyLoader}
            />
          ) : (
            <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào.</Text>
          )
        }
        ListFooterComponent={
          conversationPagination?.hasMore ? (
            <Pressable
              onPress={handleLoadMoreConversations}
              style={styles.loadMoreButton}
            >
              <Text style={styles.loadMoreText}>Tải thêm</Text>
            </Pressable>
          ) : null
        }
        ListHeaderComponent={
          <ConversationListHeader
            error={error}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        }
        contentContainerStyle={styles.listContent}
        data={filteredConversations}
        keyExtractor={(item) => String(item.conversation_id)}
        refreshControl={
          <RefreshControl
            colors={[AppColors.accent]}
            onRefresh={handleRefreshConversations}
            refreshing={isRefreshingConversations}
            tintColor={AppColors.accent}
          />
        }
        renderItem={({ item }) => (
          <ConversationRow
            conversation={item}
            onPress={() => openConversation(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </ScreenShell>
  );
}

function ConversationListHeader({
  error,
  searchQuery,
  setSearchQuery,
}: {
  error: string;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}) {
  return (
    <View style={styles.listHeader}>
      <View style={styles.searchBar}>
        <Ionicons color={AppColors.muted} name="search-outline" size={18} />
        <TextInput
          onChangeText={setSearchQuery}
          placeholder="Tìm kiếm tin nhắn..."
          placeholderTextColor={AppColors.tabInactive}
          style={styles.searchInput}
          value={searchQuery}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.filterRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {["Tất cả", "Chưa đọc", "Nhóm", "Đang hoạt động"].map(
          (label, index) => (
            <View
              key={label}
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
                {label}
              </Text>
            </View>
          ),
        )}
      </ScrollView>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function ConversationRow({
  conversation,
  onPress,
}: {
  conversation: ChatConversation;
  onPress: () => void;
}) {
  const avatarUrl = resolveMediaUrl(conversation.avatar_url);
  const preview = getPreviewText(conversation);
  const time = formatConversationTime(
    conversation.last_message_at || conversation.updated_at,
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.conversationRow,
        pressed ? styles.rowPressed : null,
      ]}
    >
      <UserAvatar imageUrl={avatarUrl} name={conversation.title} size={58} />

      <View style={styles.conversationMain}>
        <View style={styles.conversationTopLine}>
          <Text numberOfLines={1} style={styles.conversationTitle}>
            {conversation.title}
          </Text>
          <Text style={styles.conversationTime}>{time}</Text>
        </View>
        <View style={styles.conversationBottomLine}>
          <Text numberOfLines={1} style={styles.conversationPreview}>
            {preview}
          </Text>
          {conversation.unread_count > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{conversation.unread_count}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function MessageBubble({
  message,
  mine,
}: {
  message: ChatMessage;
  mine: boolean;
}) {
  return (
    <View
      style={[
        styles.messageRow,
        mine ? styles.messageRowMine : styles.messageRowOther,
      ]}
    >
      {!mine ? (
        <UserAvatar
          imageUrl={resolveMediaUrl(message.sender?.avatar_url)}
          name={message.sender?.name}
          size={30}
        />
      ) : null}
      <View
        style={[
          styles.messageBubble,
          mine ? styles.messageBubbleMine : styles.messageBubbleOther,
        ]}
      >
        {!mine ? (
          <Text numberOfLines={1} style={styles.messageSender}>
            {message.sender?.name}
          </Text>
        ) : null}
        <Text
          style={[
            styles.messageText,
            mine ? styles.messageTextMine : styles.messageTextOther,
          ]}
        >
          {message.content}
        </Text>
        <Text
          style={[
            styles.messageTime,
            mine ? styles.messageTimeMine : styles.messageTimeOther,
          ]}
        >
          {formatConversationTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  composerBar: {
    alignItems: "flex-end",
    backgroundColor: AppColors.surface,
    borderTopColor: AppColors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  composerInput: {
    backgroundColor: AppColors.surfaceMuted,
    borderRadius: 20,
    color: AppColors.text,
    flex: 1,
    fontFamily: AppFonts.body,
    fontSize: 15,
    maxHeight: 120,
    minHeight: 42,
    paddingHorizontal: 14,
    paddingTop: Platform.OS === "ios" ? 11 : 8,
  },
  composerTool: {
    alignItems: "center",
    backgroundColor: AppColors.accentSoft,
    borderRadius: 19,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  conversationBottomLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  conversationMain: {
    flex: 1,
    gap: 5,
  },
  conversationPreview: {
    color: AppColors.muted,
    flex: 1,
    fontFamily: AppFonts.body,
    fontSize: 13,
  },
  conversationRow: {
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderRadius: 18,
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 10,
    marginTop: 10,
    padding: 12,
  },
  conversationTime: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 11,
  },
  conversationTitle: {
    color: AppColors.text,
    flex: 1,
    fontFamily: AppFonts.heading,
    fontSize: 16,
  },
  conversationTopLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  emptyLoader: {
    paddingVertical: 26,
  },
  emptyText: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 14,
    paddingHorizontal: 18,
    paddingVertical: 26,
    textAlign: "center",
  },
  errorText: {
    color: AppColors.accent,
    fontFamily: AppFonts.body,
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 18,
  },
  filterChip: {
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
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
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  chatAI: {
    width: 20,
    height: 20,
  },
  chatAIImg: {
    width: "100%",
    height: "100%",
  },
  headerLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  headerIconButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 34,
  },
  listContent: {
    paddingBottom: 28,
    paddingTop: 16,
  },
  listHeader: {
    gap: 14,
  },
  loadMoreButton: {
    alignSelf: "center",
    backgroundColor: AppColors.text,
    borderRadius: 16,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  loadMoreText: {
    color: AppColors.surface,
    fontFamily: AppFonts.heading,
    fontSize: 13,
  },
  messageBubble: {
    borderRadius: 20,
    maxWidth: "78%",
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  messageBubbleMine: {
    backgroundColor: AppColors.accent,
    borderBottomRightRadius: 6,
  },
  messageBubbleOther: {
    backgroundColor: AppColors.surface,
    borderBottomLeftRadius: 6,
  },
  messageRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  messageRowMine: {
    justifyContent: "flex-end",
  },
  messageRowOther: {
    justifyContent: "flex-start",
  },
  messageSender: {
    color: AppColors.muted,
    fontFamily: AppFonts.heading,
    fontSize: 11,
    paddingBottom: 3,
  },
  messageText: {
    fontFamily: AppFonts.body,
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextMine: {
    color: AppColors.surface,
  },
  messageTextOther: {
    color: AppColors.text,
  },
  messageTime: {
    alignSelf: "flex-end",
    fontFamily: AppFonts.body,
    fontSize: 10,
    paddingTop: 4,
  },
  messageTimeMine: {
    color: "rgba(255, 255, 255, 0.78)",
  },
  messageTimeOther: {
    color: AppColors.muted,
  },
  messagesContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingBottom: 8,
    paddingTop: 12,
  },
  olderButton: {
    alignSelf: "center",
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  olderButtonText: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 12,
  },
  rowPressed: {
    opacity: 0.86,
  },
  screenTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 28,
  },
  searchBar: {
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: {
    color: AppColors.text,
    flex: 1,
    fontFamily: AppFonts.body,
    fontSize: 14,
    padding: 0,
  },
  sendButton: {
    alignItems: "center",
    backgroundColor: AppColors.accent,
    borderRadius: 19,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  threadActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  threadContainer: {
    flex: 1,
  },
  threadError: {
    color: AppColors.accent,
    fontFamily: AppFonts.body,
    fontSize: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  threadHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },
  threadSubtitle: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 12,
  },
  threadTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 16,
  },
  threadTitleBlock: {
    flex: 1,
  },
  unreadBadge: {
    alignItems: "center",
    backgroundColor: AppColors.accent,
    borderRadius: 9,
    minWidth: 18,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  unreadText: {
    color: AppColors.surface,
    fontFamily: AppFonts.heading,
    fontSize: 10,
  },
});
