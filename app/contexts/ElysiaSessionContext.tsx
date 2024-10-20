"use client";
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
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Unplug,
  Plug2,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import type { Database } from "@/types/supabase";
import { useDatabaseStore } from "@/store/supabaseCacheStore";
import { useChatStore } from "@/store/useChatStore";
import { io, Socket } from "socket.io-client";
import { toast } from "@/utils/toast";

interface ApiStats {
  apiHits: number;
  timestamp: string;
  userId: string;
}

interface ElysiaSessionContextType {
  isSessionActive: boolean;
  isServerAvailable: boolean;
  startSession: () => Promise<void>;
  stopSession: () => Promise<void>;
  lastPing: number | null;
  apiStats: ApiStats | null;
  nowPlaying: any; // Replace 'any' with the correct type from your Database type
  twitchToken: string | undefined;
  spotifyRefreshToken: string | undefined;
  handleToggleSession: () => Promise<void>;
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

const ElysiaSessionContext = createContext<
  ElysiaSessionContextType | undefined
>(undefined);

export const useElysiaSessionContext = () => {
  const context = useContext(ElysiaSessionContext);
  if (context === undefined) {
    throw new Error(
      "useElysiaSessionContext must be used within an ElysiaSessionProvider"
    );
  }
  return context;
};

export const ElysiaSessionProvider: React.FC<{
  children: React.ReactNode;
  broadcastChannel: string;
}> = ({ children, broadcastChannel }) => {
  const { isSessionActive, isServerAvailable, startSession, stopSession } =
    useElysiaSession(broadcastChannel);
  const { oauthTokens } = useCombinedStore();
  const { userId, sessionId } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const twitchToken = oauthTokens.twitch?.[0]?.token;
  const spotifyRefreshToken = oauthTokens.spotify?.refreshToken;
  const nowPlaying = useDatabaseStore((state) => state.VisualizerWidget?.[0]);
  const { apiStats, setApiStats } = useChatStore();
  const [lastPing, setLastPing] = useState<number | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const elysiaWsUrl = process.env.NEXT_PUBLIC_ELYSIA_WS_URL;

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
          console.warn("Failed to connect to socket server:", error);
          toast.error({ title: "Failed to connect to Elysia server" });
        });

        newSocket.on("disconnect", (reason) => {
          console.log("Disconnected from socket server:", reason);
          toast.info({ title: "Disconnected from Elysia server" });
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
              userId: data.userId,
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

  const value = {
    isSessionActive,
    isServerAvailable,
    startSession,
    stopSession,
    lastPing,
    apiStats,
    nowPlaying,
    twitchToken,
    spotifyRefreshToken,
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
