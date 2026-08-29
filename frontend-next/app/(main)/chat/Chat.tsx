"use client";

import {
  RiArrowLeftLine,
  RiMessage3Line,
  RiSearchLine,
  RiSendPlaneFill,
} from "@remixicon/react";
import {
  FormEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import port from "@/api/api";
import { useSocket } from "@/context/SocketContext";
import { useUser } from "@/context/useUserContext";

const CONVERSATION_LIMIT = 30;
const MESSAGE_LIMIT = 40;
const MAX_MESSAGE_LENGTH = 2000;
const DEFAULT_AVATAR = "/Profile-Default.webp";

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

type ChatUser = {
  user_id: number;
  name?: string | null;
  username?: string | null;   
  avatar?: string | null;
  avata?: string | null;
  avatar_url?: string | null;
};

type ChatMessage = {
  message_id: number;
  conversation_id: number;
  sender_id: number;
  content: string | null;
  message_type: string;
  is_edited?: boolean;
  is_deleted?: boolean;
  reply_to_message_id?: number | null;
  created_at: string;
  updated_at?: string;
  sender?: ChatUser | null;
};

type ChatConversation = {
  conversation_id: number;
  type: "private" | "group";
  name: string | null;
  title: string;
  avatar: string | null;
  avatar_url: string | null;
  last_message_id: number | null;
  last_message_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_message: ChatMessage | null;
  participants: ChatUser[];
  participant_ids: number[];
  unread_count: number;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

type PageData<T> = {
  items: T[];
  pagination: Pagination;
};

type ChatEventPayload = {
  conversation: ChatConversation | null;
  message: ChatMessage;
  participant_ids?: number[];
};

type SendAck = ApiResponse<{
  conversation: ChatConversation;
  message: ChatMessage;
}>;

const resolveMediaUrl = (value?: string | null) => {
  if (!value) {
    return DEFAULT_AVATAR;
  }

  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) {
    return value;
  }

  return `${port}/${value.replace(/^\/+/, "")}`;
};

const getMessageTime = (message: ChatMessage) => {
  const createdTime = Date.parse(message.created_at);

  if (!Number.isNaN(createdTime)) {
    return createdTime;
  }

  return Number(message.message_id) || 0;
};

const getConversationTime = (conversation: ChatConversation) => {
  const value =
    conversation.last_message_at ||
    conversation.updated_at ||
    conversation.created_at;
  const time = value ? Date.parse(value) : 0;

  return Number.isNaN(time) ? 0 : time;
};

const sortConversations = (items: ChatConversation[]) =>
  [...items].sort((first, second) => getConversationTime(second) - getConversationTime(first));

const mergeMessages = (current: ChatMessage[], incoming: ChatMessage[]) => {
  const byId = new Map<number, ChatMessage>();

  for (const message of [...current, ...incoming]) {
    if (message?.message_id) {
      byId.set(message.message_id, message);
    }
  }

  return [...byId.values()].sort((first, second) => getMessageTime(first) - getMessageTime(second));
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

const upsertConversation = (
  current: ChatConversation[],
  incoming: ChatConversation,
) => {
  const next = current.some(
    (conversation) => conversation.conversation_id === incoming.conversation_id,
  )
    ? current.map((conversation) =>
        conversation.conversation_id === incoming.conversation_id
          ? incoming
          : conversation,
      )
    : [incoming, ...current];

  return sortConversations(next);
};

const getPreviewText = (conversation: ChatConversation) => {
  const lastMessage = conversation.last_message;

  if (!lastMessage) {
    return "Bat dau cuoc tro chuyen";
  }

  if (lastMessage.message_type !== "text") {
    return "Da gui mot tep dinh kem";
  }

  return lastMessage.content || "Tin nhan moi";
};

const formatChatTime = (value?: string | null) => {
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

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

async function readJson<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    return {
      success: false,
      message: "Khong the doc phan hoi tu may chu.",
    };
  }
}

function ChatAvatar({
  alt,
  className,
  src,
}: {
  alt: string;
  className: string;
  src?: string | null;
}) {
  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = DEFAULT_AVATAR;
  };

  return (
    <img
      alt={alt}
      className={`shrink-0 rounded-full object-cover ${className}`}
      draggable={false}
      onError={handleImageError}
      src={resolveMediaUrl(src)}
    />
  );
}

export default function Chat() {
  const { user, isLoading } = useUser();
  const { socket, isConnected } = useSocket();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [conversationPagination, setConversationPagination] =
    useState<Pagination | null>(null);
  const [activeConversation, setActiveConversation] =
    useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagePagination, setMessagePagination] = useState<Pagination | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [composerText, setComposerText] = useState("");
  const [error, setError] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isMobileThreadOpen, setIsMobileThreadOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const activeConversationId = activeConversation?.conversation_id ?? null;

  const loadConversations = useCallback(
    async (page = 1, replace = true) => {
      if (!user?.user_id) {
        return;
      }

      if (replace) {
        setIsLoadingConversations(true);
      }

      try {
        const response = await fetch(
          `${port}/api/chats/conversations?page=${page}&limit=${CONVERSATION_LIMIT}`,
          {
            credentials: "include",
          },
        );
        const payload = await readJson<PageData<ChatConversation>>(response);

        const data = payload.data;

        if (!response.ok || !payload.success || !data) {
          throw new Error(payload.message || "Khong the tai hoi thoai.");
        }

        setConversationPagination(data.pagination);
        setConversations((current) =>
          replace
            ? sortConversations(data.items)
            : sortConversations([...current, ...data.items]),
        );
        setError("");
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Khong the tai hoi thoai."));
      } finally {
        setIsLoadingConversations(false);
      }
    },
    [user?.user_id],
  );

  const loadMessages = useCallback(
    async (conversationId: number, page = 1, replace = true) => {
      if (!user?.user_id) {
        return;
      }

      if (replace) {
        setIsLoadingMessages(true);
      } else {
        setIsLoadingOlderMessages(true);
      }

      try {
        const response = await fetch(
          `${port}/api/chats/conversations/${conversationId}/messages?page=${page}&limit=${MESSAGE_LIMIT}`,
          {
            credentials: "include",
          },
        );
        const payload = await readJson<PageData<ChatMessage>>(response);

        const data = payload.data;

        if (!response.ok || !payload.success || !data) {
          throw new Error(payload.message || "Khong the tai tin nhan.");
        }

        setMessagePagination(data.pagination);
        setMessages((current) =>
          replace ? mergeMessages([], data.items) : mergeMessages(data.items, current),
        );
        setError("");
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Khong the tai tin nhan."));
      } finally {
        setIsLoadingMessages(false);
        setIsLoadingOlderMessages(false);
      }
    },
    [user?.user_id],
  );

  useEffect(() => {
    if (!isLoading) {
      loadConversations(1, true);
    }
  }, [isLoading, loadConversations]);

  useEffect(() => {
    if (!activeConversation && conversations.length > 0) {
      setActiveConversation(conversations[0]);
    }
  }, [activeConversation, conversations]);

  useEffect(() => {
    if (!activeConversationId) {
      return;
    }

    setMessages([]);
    setMessagePagination(null);
    loadMessages(activeConversationId, 1, true);
  }, [activeConversationId, loadMessages]);

  useEffect(() => {
    if (!socket || !activeConversationId) {
      return;
    }

    socket.emit("chat:join", { conversation_id: activeConversationId });

    return () => {
      socket.emit("chat:leave", { conversation_id: activeConversationId });
    };
  }, [activeConversationId, socket]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleChatPayload = (payload: ChatEventPayload) => {
      if (!payload?.message?.message_id) {
        return;
      }

      const nextConversation = payload.conversation
        ? touchConversationWithMessage(payload.conversation, payload.message)
        : null;

      if (nextConversation) {
        setConversations((current) => upsertConversation(current, nextConversation));
        setActiveConversation((current) =>
          current?.conversation_id === nextConversation.conversation_id
            ? nextConversation
            : current,
        );
      } else {
        loadConversations(1, true);
      }

      if (payload.message.conversation_id === activeConversationId) {
        setMessages((current) => mergeMessages(current, [payload.message]));
      }
    };

    const handleChatError = (payload: { message?: string }) => {
      setError(payload.message || "Realtime chat bi gian doan.");
    };

    socket.on("receive_message", handleChatPayload);
    socket.on("conversation_updated", handleChatPayload);
    socket.on("chat:error", handleChatError);

    return () => {
      socket.off("receive_message", handleChatPayload);
      socket.off("conversation_updated", handleChatPayload);
      socket.off("chat:error", handleChatError);
    };
  }, [activeConversationId, loadConversations, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, activeConversationId]);

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

  const handleOpenConversation = (conversation: ChatConversation) => {
    setActiveConversation(conversation);
    setIsMobileThreadOpen(true);
  };

  const handleLoadMoreConversations = () => {
    if (
      conversationPagination?.hasMore &&
      !isLoadingConversations &&
      conversationPagination.page
    ) {
      loadConversations(conversationPagination.page + 1, false);
    }
  };

  const handleLoadOlderMessages = () => {
    if (
      activeConversationId &&
      messagePagination?.hasMore &&
      !isLoadingOlderMessages
    ) {
      loadMessages(activeConversationId, messagePagination.page + 1, false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!socket || !activeConversationId || isSending) {
      return;
    }

    const content = composerText.trim().slice(0, MAX_MESSAGE_LENGTH);

    if (!content) {
      return;
    }

    setComposerText("");
    setIsSending(true);
    setError("");

    socket.timeout(7000).emit(
      "send_message",
      {
        conversation_id: activeConversationId,
        content,
        message_type: "text",
      },
      (sendError: Error | null, payload?: SendAck) => {
        setIsSending(false);

        const responseData = payload?.data;

        if (sendError || !payload?.success || !responseData) {
          setComposerText(content);
          setError(payload?.message || "Khong the gui tin nhan.");
          return;
        }

        const nextConversation = touchConversationWithMessage(
          responseData.conversation,
          responseData.message,
        );

        setMessages((current) => mergeMessages(current, [responseData.message]));
        setConversations((current) => upsertConversation(current, nextConversation));
        setActiveConversation(nextConversation);
      },
    );
  };

  const activeAvatar =
    activeConversation?.avatar_url || activeConversation?.avatar || null;

  return (
    <section className="h-[calc(100dvh-64px)] bg-white pb-16 lg:fixed lg:inset-y-0 lg:left-[25%] lg:right-0 lg:z-60 lg:h-screen lg:pb-0">
      <div className="grid h-full overflow-hidden border-x border-black/10 bg-white md:grid-cols-[320px_minmax(0,1fr)]">
        <aside
          className={`h-full min-h-0 flex-col border-r border-black/10 bg-white ${
            isMobileThreadOpen ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-black/10 px-5">
            <div>
              <h1 className="text-xl font-bold leading-tight text-black">Tin nhan</h1>
              <p className="text-xs text-black/50">
                {isConnected ? "Dang ket noi realtime" : "Dang cho ket noi"}
              </p>
            </div>
            <RiMessage3Line className="text-black/60" />
          </div>

          <div className="border-b border-black/10 p-3">
            <label className="flex h-10 items-center gap-2 rounded-full bg-black/5 px-3 text-sm text-black/60">
              <RiSearchLine size={18} />
              <input
                aria-label="Tim kiem hoi thoai"
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-black/45"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tim kiem"
                type="search"
                value={searchQuery}
              />
            </label>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto py-2">
            {isLoadingConversations ? (
              <p className="px-5 py-8 text-center text-sm text-black/50">
                Dang tai hoi thoai...
              </p>
            ) : filteredConversations.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-black/50">
                Chua co cuoc tro chuyen nao.
              </p>
            ) : (
              filteredConversations.map((conversation) => {
                const selected =
                  conversation.conversation_id === activeConversationId;
                const preview = getPreviewText(conversation);
                const time = formatChatTime(
                  conversation.last_message_at || conversation.updated_at,
                );

                return (
                  <button
                    className={`grid w-full grid-cols-[52px_minmax(0,1fr)] items-center gap-3 px-3 py-3 text-left transition ${
                      selected ? "bg-sky-50" : "hover:bg-black/5"
                    }`}
                    key={conversation.conversation_id}
                    onClick={() => handleOpenConversation(conversation)}
                    type="button"
                  >
                    <ChatAvatar
                      alt={conversation.title}
                      className="h-12 w-12"
                      src={conversation.avatar_url || conversation.avatar}
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-black">
                          {conversation.title}
                        </span>
                        <span className="shrink-0 text-[11px] text-black/45">
                          {time}
                        </span>
                      </span>
                      <span className="mt-1 flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-xs text-black/50">
                          {preview}
                        </span>
                        {conversation.unread_count > 0 ? (
                          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-sky-600 px-1 text-[10px] font-semibold text-white">
                            {conversation.unread_count}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {conversationPagination?.hasMore ? (
            <div className="border-t border-black/10 p-3">
              <button
                className="h-10 w-full rounded-md border border-black/10 text-sm font-semibold text-black transition hover:bg-black/5 disabled:opacity-60"
                disabled={isLoadingConversations}
                onClick={handleLoadMoreConversations}
                type="button"
              >
                Tai them
              </button>
            </div>
          ) : null}
        </aside>

        <section
          className={`h-full min-h-0 flex-col bg-[#f6f7f9] ${
            isMobileThreadOpen ? "flex" : "hidden md:flex"
          }`}
        >
          {activeConversation ? (
            <>
              <header className="flex h-16 shrink-0 items-center gap-3 border-b border-black/10 bg-white px-4">
                <button
                  aria-label="Quay lai danh sach"
                  className="grid h-9 w-9 place-items-center rounded-full text-black transition hover:bg-black/5 md:hidden"
                  onClick={() => setIsMobileThreadOpen(false)}
                  title="Quay lai"
                  type="button"
                >
                  <RiArrowLeftLine size={22} />
                </button>
                <ChatAvatar
                  alt={activeConversation.title}
                  className="h-10 w-10"
                  src={activeAvatar}
                />
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-black">
                    {activeConversation.title}
                  </h2>
                  <p className="text-xs text-black/50">
                    {isConnected ? "Dang hoat dong" : "Ngoai tuyen"}
                  </p>
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                {messagePagination?.hasMore ? (
                  <div className="mb-4 flex justify-center">
                    <button
                      className="h-9 rounded-full border border-black/10 bg-white px-4 text-xs font-semibold text-black transition hover:bg-black/5 disabled:opacity-60"
                      disabled={isLoadingOlderMessages}
                      onClick={handleLoadOlderMessages}
                      type="button"
                    >
                      {isLoadingOlderMessages ? "Dang tai..." : "Tai tin cu hon"}
                    </button>
                  </div>
                ) : null}

                {isLoadingMessages ? (
                  <p className="py-10 text-center text-sm text-black/50">
                    Dang tai tin nhan...
                  </p>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="max-w-xs text-center text-sm text-black/50">
                      Hay gui loi chao dau tien trong cuoc tro chuyen nay.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {messages.map((message) => {
                      const mine = Number(message.sender_id) === Number(user?.user_id);

                      return (
                        <div
                          className={`flex items-end gap-2 ${
                            mine ? "justify-end" : "justify-start"
                          }`}
                          key={message.message_id}
                        >
                          {!mine ? (
                            <ChatAvatar
                              alt={message.sender?.name || "avatar"}
                              className="h-8 w-8"
                              src={message.sender?.avatar_url || message.sender?.avata}
                            />
                          ) : null}
                          <div
                            className={`max-w-[78%] rounded-2xl px-3 py-2 shadow-sm ${
                              mine
                                ? "rounded-br-md bg-sky-600 text-white"
                                : "rounded-bl-md bg-white text-black"
                            }`}
                          >
                            {!mine && message.sender?.name ? (
                              <p className="pb-1 text-[11px] font-semibold text-black/50">
                                {message.sender.name}
                              </p>
                            ) : null}
                            <p className="whitespace-pre-wrap wrap-break-words text-sm leading-5">
                              {message.content}
                            </p>
                            <p
                              className={`pt-1 text-right text-[10px] ${
                                mine ? "text-white/75" : "text-black/40"
                              }`}
                            >
                              {formatChatTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {error ? (
                <p className="border-t border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
                  {error}
                </p>
              ) : null}

              <form
                className="flex shrink-0 items-end gap-2 border-t border-black/10 bg-white p-3"
                onSubmit={handleSubmit}
              >
                <textarea
                  autoComplete="off"
                  className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl bg-black/5 px-4 py-3 text-sm text-black outline-none placeholder:text-black/45"
                  maxLength={MAX_MESSAGE_LENGTH}
                  onChange={(event) => setComposerText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  placeholder="Nhan tin..."
                  rows={1}
                  value={composerText}
                />
                <button
                  aria-label="Gui tin nhan"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sky-600 text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-black/20"
                  disabled={!composerText.trim() || isSending || !isConnected}
                  title="Gui"
                  type="submit"
                >
                  <RiSendPlaneFill size={19} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-6">
              <div className="text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-black shadow-sm">
                  <RiMessage3Line size={30} />
                </div>
                <h2 className="mt-4 text-base font-semibold text-black">
                  Chon mot cuoc tro chuyen
                </h2>
                <p className="mt-1 max-w-xs text-sm text-black/50">
                  Lich su tin nhan se hien thi o day.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
