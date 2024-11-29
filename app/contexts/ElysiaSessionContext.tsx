import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useElysiaSession } from "@/hooks/useElysiaSession";
import { useCombinedStore } from "@/store";
import { useAuth } from "@clerk/tanstack-start";

import { supabase } from "@/utils/supabase/client";
import type { Database } from "@/types/supabase";
import { useDatabaseStore } from "@/store/supabaseCacheStore";
import { useChatStore } from "@/store/useChatStore";
import { io, Socket } from "socket.io-client";
import { toast } from "@/utils/toast";
import { useSpotifyStore } from "@/store/spotifyStore";
import { useVisualizerWidgetSubscription } from "@/store/supabaseCacheStore";

interface ApiStats {
  apiHits: number;
  timestamp: string;
  userId?: string;
}

interface ElysiaSessionContextType {
  isSessionActive: boolean;
  isServerAvailable: boolean;
  startSession: () => Promise<void>;
  stopSession: () => Promise<void>;
  lastPing: number | null;
  apiStats: ApiStats | null;
  nowPlaying: any | null;
  twitchToken: string | null;
  spotifyRefreshToken: string | null;
  updateSpotifyToken: (token: string) => void;
  handleToggleSession: () => Promise<void>;
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

const ElysiaSessionContext = createContext<
  ElysiaSessionContextType | undefined
>(undefined);

export const useElysiaSessionContext = () => {
  const context = useContext(ElysiaSessionContext);
  if (!context) {
    throw new Error(
      "useElysiaSessionContext must be used within an ElysiaSessionProvider"
    );
  }
  return context;
};

interface ElysiaSessionProviderProps {
  children: React.ReactNode;
  broadcastChannel?: string;
}

export const ElysiaSessionProvider: React.FC<ElysiaSessionProviderProps> = ({
  children,
  broadcastChannel = "",
}) => {
  const { isSessionActive, isServerAvailable, startSession, stopSession } =
    useElysiaSession(broadcastChannel);
  const { oauthTokens } = useCombinedStore();
  const { userId } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const twitchToken = oauthTokens.twitch?.[0]?.token ?? null;
  const { spotifyRefreshToken } = useSpotifyStore();
  const nowPlaying = useDatabaseStore((state) => {
    const widget = state.VisualizerWidget?.[0];
    if (!widget?.track) return null;
    return typeof widget.track === "string"
      ? JSON.parse(widget.track)
      : widget.track;
  });
  const { apiStats, setApiStats } = useChatStore();
  const [lastPing, setLastPing] = useState<number | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const elysiaWsUrl = import.meta.env.VITE_ELYSIA_WS_URL;

  useVisualizerWidgetSubscription(userId);

  useEffect(() => {
    if (!socketRef.current && isServerAvailable) {
      const newSocket = io(elysiaWsUrl || "http://localhost:3000", {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ["websocket"],
        query: { userId },
      });

      const setupSocketListeners = () => {
        newSocket.on("connect", () => {
          console.log("Connected to socket server");
          toast.success({ title: "Connected to Elysia server" });
        });

        newSocket.on("connect_error", (error) => {
          // console.warn("Failed to connect to socket server:", error);
          // toast.error({ title: "Failed to connect to Elysia server" });
        });

        newSocket.on("disconnect", (reason) => {
          // console.log("Disconnected from socket server:", reason);
          // toast.info({ title: "Disconnected from Elysia server" });
        });

        newSocket.on("pong", () => {
          setLastPing(Date.now());
        });
      };

      setupSocketListeners();
      socketRef.current = newSocket;

      const pingInterval = setInterval(() => {
        if (newSocket.connected) {
          newSocket.emit("ping");
        }
      }, 20000);

      return () => {
        clearInterval(pingInterval);
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [isServerAvailable, userId, elysiaWsUrl]);

  useEffect(() => {
    const socket = socketRef.current;
    if (socket) {
      socket.on("spotifyApiStats", (stats: ApiStats) => {
        if (stats.userId === userId) {
          setApiStats(stats);
        }
      });

      socket.on(
        "spotifyApiStatsReset",
        (data: { timestamp: string; userId: string }) => {
          if (data.userId === userId) {
            setApiStats({
              apiHits: 0,
              timestamp: data.timestamp,
            });
          }
        }
      );

      return () => {
        socket.off("spotifyApiStats");
        socket.off("spotifyApiStatsReset");
      };
    }
  }, [userId, setApiStats]);

  const upsertUserProfile = async (
    userId: string,
    data: Partial<Database["public"]["Tables"]["UserProfile"]["Update"]>
  ) => {
    const { data: result, error } = await supabase
      .from("UserProfile")
      .upsert({ user_id: userId, ...data }, { onConflict: "user_id" })
      .select();

    if (error) throw error;
    return result;
  };

  useEffect(() => {
    const updateUserProfile = async () => {
      if (userId) {
        try {
          await upsertUserProfile(userId, { is_active: isSessionActive });
        } catch (error) {
          console.error("Failed to update user profile:", error);
          toast.error({
            title: "Failed to update user profile",
          });
        }
      }
    };

    updateUserProfile();
  }, [userId, isSessionActive]);

  const handleToggleSession = async () => {
    try {
      if (isSessionActive) {
        await stopSession();
      } else {
        await startSession();
      }
    } catch (error) {
      console.error("Failed to toggle session:", error);
      toast.error({
        title: "Failed to toggle session",
      });
    }
  };

  const updateSpotifyToken = (token: string) => {
    // No need to update the store here, as it's handled by the store
  };

  const wrappedStartSession = async () => {
    return new Promise<void>((resolve) => {
      startSession();
      resolve();
    });
  };

  const wrappedStopSession = async () => {
    return stopSession();
  };

  const value: ElysiaSessionContextType = {
    isSessionActive,
    isServerAvailable,
    startSession: wrappedStartSession,
    stopSession: wrappedStopSession,
    lastPing,
    apiStats,
    nowPlaying,
    twitchToken,
    spotifyRefreshToken,
    updateSpotifyToken,
    handleToggleSession,
    isExpanded,
    setIsExpanded,
  };

  return (
    <ElysiaSessionContext.Provider value={value}>
      {children}
    </ElysiaSessionContext.Provider>
  );
};
