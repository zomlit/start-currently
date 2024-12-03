import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
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

type ErrorLine = {
  id: string;
  message: string;
  timestamp: Date;
  type: "error" | "warning";
  line?: string;
  key?: string;
};

type ElysiaSessionContextType = {
  isSessionActive: boolean;
  isServerAvailable: boolean;
  lastPing: number | null;
  apiStats: any;
  nowPlaying: any;
  twitchToken: string | null;
  handleToggleSession: () => Promise<void>;
  sessionStatus: {
    spotify: {
      isConnected: boolean;
      lastChecked: Date | null;
      latency: number | null;
    };
    twitch: {
      isConnected: boolean;
      lastChecked: Date | null;
    };
  };
  sessionStartTime: number | null;
  formatUptime: (startTime: number | null) => string;
  formatConsoleValue: (value: any) => string;
  getApiHitColor: (hits: number) => string;
  addConsoleMessage: (
    message: string,
    type?: "info" | "success" | "error",
    details?: Record<string, any>
  ) => void;
  clearConsoleMessages: () => void;
  apiHits: number;
  setApiHits: React.Dispatch<React.SetStateAction<number>>;
  latency: number | null;
  setLatency: React.Dispatch<React.SetStateAction<number | null>>;
  sessionErrors: ErrorLine[];
  setSessionErrors: React.Dispatch<React.SetStateAction<ErrorLine[]>>;
  isSpotifyVerified: boolean;
  setIsSpotifyVerified: React.Dispatch<React.SetStateAction<boolean>>;
};

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
  const { userId, getToken } = useAuth();
  const { oauthTokens } = useCombinedStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const twitchToken = oauthTokens?.twitch?.[0]?.token ?? null;
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
  const [apiHits, setApiHits] = useState(0);
  const [latency, setLatency] = useState<number | null>(null);
  const [sessionErrors, setSessionErrors] = useState<ErrorLine[]>([]);
  const [consoleMessages, setConsoleMessages] = useState<
    Array<{
      id: string;
      message: string;
      timestamp: Date;
      type: "info" | "success" | "error";
      details?: Record<string, any>;
    }>
  >([]);
  const [isSpotifyVerified, setIsSpotifyVerified] = useState(false);

  useVisualizerWidgetSubscription(userId);

  const connectToSocket = (userId: string) => {
    const apiUrl =
      import.meta.env.VITE_ELYSIA_API_URL || "http://localhost:9001";
    const wsUrl = apiUrl.replace(/^http/, "ws"); // This will convert http:// to ws:// and https:// to wss://

    const socket = io(wsUrl, {
      transports: ["websocket", "polling"],
      path: "/socket.io/",
      auth: {
        userId,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    return socket;
  };

  useEffect(() => {
    if (userId) {
      const socket = connectToSocket(userId);

      return () => {
        socket.disconnect();
      };
    }
  }, [userId]);

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

  const formatUptime = useCallback((startTime: number | null) => {
    if (!startTime) return "Not started";
    const diff = Date.now() - startTime;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }, []);

  const formatConsoleValue = useCallback((value: any): string => {
    if (typeof value === "object" && value !== null) {
      return Object.entries(value)
        .map(([k, v]) => `\n    ${k}: ${formatConsoleValue(v)}`)
        .join("");
    }
    return String(value);
  }, []);

  const getApiHitColor = useCallback((hits: number) => {
    const percentage = (hits / 60) * 100;
    if (percentage < 50) return "text-emerald-400";
    if (percentage < 75) return "text-yellow-300";
    return "text-pink-500";
  }, []);

  const addConsoleMessage = useCallback(
    (
      message: string,
      type: "info" | "success" | "error" = "info",
      details?: Record<string, any>
    ) => {
      setConsoleMessages((prev) => [
        {
          id: crypto.randomUUID(),
          message,
          timestamp: new Date(),
          type,
          details,
        },
        ...prev.slice(0, 49),
      ]);
    },
    []
  );

  const clearConsoleMessages = useCallback(() => {
    setConsoleMessages([]);
  }, []);

  useEffect(() => {
    if (!isSessionActive) {
      setLatency(null);
      return;
    }

    const checkLatency = async () => {
      const start = performance.now();
      try {
        const apiUrl = import.meta.env.VITE_ELYSIA_API_URL;
        if (!apiUrl) return;

        const response = await fetch(`${apiUrl}/health-check`);
        if (response.ok) {
          const end = performance.now();
          setLatency(Math.round(end - start));
        }
      } catch (error) {
        setLatency(null);
      }
    };

    checkLatency();
    const interval = setInterval(checkLatency, 5000);
    return () => clearInterval(interval);
  }, [isSessionActive]);

  useEffect(() => {
    const verifySpotify = async () => {
      if (!spotifyRefreshToken || !isSessionActive || !userId) return;

      try {
        const clerkToken = await getToken({ template: "lstio" });
        const apiUrl = import.meta.env.VITE_ELYSIA_API_URL;
        if (!apiUrl) return;

        const response = await fetch(`${apiUrl}/api/spotify/verify`, {
          headers: {
            Authorization: `Bearer ${clerkToken}`,
            "X-User-Id": userId || "",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to verify Spotify: ${response.status}`);
        }

        const data = await response.json();
        setIsSpotifyVerified(data.success && data.spotify?.isConnected);
      } catch (error) {
        console.error("Failed to verify Spotify connection:", error);
        setIsSpotifyVerified(false);
      }
    };

    verifySpotify();
  }, [isSessionActive, spotifyRefreshToken, userId, getToken]);

  const value = useMemo<ElysiaSessionContextType>(
    () => ({
      isSessionActive,
      isServerAvailable,
      lastPing,
      apiStats,
      nowPlaying,
      twitchToken,
      handleToggleSession,
      sessionStatus: {
        spotify: {
          isConnected: !!spotifyRefreshToken && isSpotifyVerified,
          lastChecked: null,
          latency: latency,
        },
        twitch: {
          isConnected: !!twitchToken,
          lastChecked: null,
        },
      },
      sessionStartTime: null,
      formatUptime,
      formatConsoleValue,
      getApiHitColor,
      addConsoleMessage,
      clearConsoleMessages,
      apiHits,
      setApiHits,
      latency,
      setLatency,
      sessionErrors,
      setSessionErrors,
      isSpotifyVerified,
      setIsSpotifyVerified,
    }),
    [
      isSessionActive,
      isServerAvailable,
      lastPing,
      apiStats,
      nowPlaying,
      twitchToken,
      handleToggleSession,
      formatUptime,
      formatConsoleValue,
      getApiHitColor,
      addConsoleMessage,
      clearConsoleMessages,
      apiHits,
      latency,
      sessionErrors,
      spotifyRefreshToken,
      isSpotifyVerified,
    ]
  );

  return (
    <ElysiaSessionContext.Provider value={value}>
      {children}
    </ElysiaSessionContext.Provider>
  );
};
