import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { io, Socket } from "socket.io-client";
import { Message, Badge, ChatMessage, Emote } from "@/types/chat";
import { supabase } from "@/utils/supabase/client";
interface PersistentState {
  messages: Message[];
  isConnected: boolean;
  error: string | null;
}

interface NonPersistentState {
  socket: Socket | null;
  supabaseSubscription: any;
}

interface ApiStats {
  apiHits: number;
  timestamp: string;
}

export interface ChatState extends PersistentState, NonPersistentState {
  apiStats: ApiStats;
  setApiStats: (stats: ApiStats) => void;
  connect: (channel: string, userId: string, twitchAccessToken: string) => void;
  disconnect: () => void;
  sendMessage: (content: string) => void;
  addMessage: (message: Message) => void;
  fetchInitialMessages: (channel: string) => Promise<void>;
}

const initialState: PersistentState = {
  messages: [],
  isConnected: false,
  error: null,
};

const formatBadges = (badges: any) => {
  if (!badges) return { user: [], global: [], channel: [] };
  const formatBadgeArray = (badgeArray: any[]) =>
    badgeArray.map((badge) => ({
      ...badge,
      urls: badge.urls || {
        "1x": `https://static-cdn.jtvnw.net/badges/v1/${badge.id}/${badge.version}/1`,
        "2x": `https://static-cdn.jtvnw.net/badges/v1/${badge.id}/${badge.version}/2`,
        "4x": `https://static-cdn.jtvnw.net/badges/v1/${badge.id}/${badge.version}/3`,
      },
    }));
  return {
    user: formatBadgeArray(badges.user || []),
    global: formatBadgeArray(badges.global || []),
    channel: formatBadgeArray(badges.channel || []),
  };
};

const formatEmotes = (emotes: any[]): Emote[] => {
  return emotes.map((emote) => ({
    id: emote.id,
    name: emote.name,
    url: emote.url,
    provider: emote.provider,
    positions: emote.positions,
  }));
};

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        socket: null,
        supabaseSubscription: null,
        apiStats: {
          apiHits: 0,
          timestamp: new Date().toISOString(),
        } as ApiStats,

        setApiStats: (stats: ApiStats) => {
          set((state) => ({ ...state, apiStats: stats }));
        },

        connect: (
          channel: string,
          userId: string,
          twitchAccessToken: string
        ) => {
          console.log(
            `Attempting to connect to chat. Channel: ${channel}, UserId: ${userId}`
          );

          const existingSocket = get().socket;
          if (existingSocket) {
            console.log("Closing existing socket connection");
            existingSocket.disconnect();
          }

          const socketUrl = `${import.meta.env.VITE_ELYSIA_WS_URL}`;
          console.log(`Connecting to socket server at: ${socketUrl}`);

          const socket = io(socketUrl, {
            transports: ["websocket"],
            auth: {
              userId,
              twitchAccessToken,
              channel,
            },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelayMax: 10000,
            timeout: 20000,
          });

          socket.on("connect", () => {
            console.log("Socket connected successfully");
            set((state) => ({ ...state, isConnected: true, error: null }));
            console.log(`Joining channel: ${channel}`);
            socket.emit("join", { channel, userId });
          });

          socket.on("chat_message", (message: any) => {
            console.log("Received chat message:", message);
            const updatedMessage = {
              ...message,
              platform: "Twitch",
              badges: formatBadges(message.badges),
              emotes: formatEmotes(message.emotes),
            };
            set((state) => ({
              ...state,
              messages: [...state.messages.slice(-19), updatedMessage],
            }));
          });

          socket.on("spotifyApiStats", (stats: ApiStats) => {
            set((state) => ({ ...state, apiStats: stats }));
          });

          set((state) => ({ ...state, socket }));

          const subscription = supabase
            .channel(`public:chat_messages:channel=eq.${channel}`)
            .on(
              "postgres_changes",
              {
                event: "INSERT",
                schema: "public",
                table: "chat_messages",
                filter: `channel=eq.${channel}`,
              },
              (payload) => {
                const newMessage: ChatMessage = payload.new as ChatMessage;
                const formattedMessage: Message = {
                  id: newMessage.id,
                  username: newMessage.username,
                  message: newMessage.message,
                  timestamp: new Date(newMessage.timestamp).getTime(),
                  type: "chat",
                  avatar: newMessage.avatar,
                  badges: formatBadges(newMessage.badges),
                  emotes: formatEmotes(newMessage.emotes),
                  color: newMessage.color,
                  platform: "Twitch",
                };
                set((state) => ({
                  ...state,
                  messages: [...state.messages.slice(-19), formattedMessage],
                }));
              }
            )
            .subscribe();

          set((state) => ({ ...state, supabaseSubscription: subscription }));
        },

        disconnect: () => {
          const { socket, supabaseSubscription } = get();
          if (socket) {
            console.log("Disconnecting socket");
            socket.removeAllListeners();
            socket.disconnect();
          }
          if (supabaseSubscription) {
            supabase.removeChannel(supabaseSubscription);
          }
          set((state) => ({
            ...state,
            socket: null,
            supabaseSubscription: null,
            isConnected: false,
          }));
        },

        sendMessage: (content: string) => {
          const { socket } = get();
          if (socket) {
            console.log("Sending message:", content);
            socket.emit("chat_message", { content });
          } else {
            console.error("Cannot send message: Socket is not connected");
          }
        },

        addMessage: (message) => {
          set((state) => ({
            ...state,
            messages: [...state.messages, message],
          }));
        },

        fetchInitialMessages: async (channel: string) => {
          try {
            console.log(`Fetching initial messages for channel: ${channel}`);
            const formattedChannel = channel.startsWith("#")
              ? channel
              : `${channel}`;
            console.log("Formatted channel:", formattedChannel);

            const response = await fetch(
              `/api/chat/messages?channel=${formattedChannel}&limit=20`
            );
            if (!response.ok) {
              throw new Error(
                `Failed to fetch initial messages: ${response.statusText}`
              );
            }
            const initialMessages: ChatMessage[] = await response.json();
            console.log(
              `Fetched ${initialMessages.length} initial messages:`,
              initialMessages
            );
            const formattedMessages: Message[] = initialMessages.map((msg) => ({
              id: msg.id,
              username: msg.username,
              message: msg.message,
              timestamp: new Date(msg.timestamp).getTime(),
              type: "chat",
              avatar: msg.avatar,
              badges: formatBadges(msg.badges),
              emotes: formatEmotes(msg.emotes),
              color: msg.color,
              platform: "Twitch",
            }));
            console.log(
              `Formatted ${formattedMessages.length} messages:`,
              formattedMessages
            );
            set((state) => ({
              ...state,
              messages: formattedMessages.reverse(),
            }));
            console.log("Updated messages in store:", get().messages);
          } catch (error) {
            console.error("Error fetching initial messages:", error);
            set((state) => ({
              ...state,
              error: "Failed to fetch initial messages",
            }));
          }
        },
      }),
      {
        name: "chat-storage",
        partialize: (state) => ({
          messages: state.messages,
          isConnected: state.isConnected,
          error: state.error,
          // Don't persist apiStats
        }),
      }
    ),
    { name: "ChatStore" }
  )
);
