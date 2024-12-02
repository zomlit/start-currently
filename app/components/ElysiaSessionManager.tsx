import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Settings2,
  AlertTriangle,
  CircleX,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { useElysiaSessionContext } from "@/contexts/ElysiaSessionContext";
import { useAuth } from "@clerk/tanstack-start";
import { useSpotifyStore } from "@/store/spotifyStore";
import BrandElysia from "@/icons/filled/brand-elysia.svg?react";
import { IconBadge } from "./ui/icon-badge";
import { useOAuthStore } from "@/store/oauthStore";
import { useIsClient } from "@/hooks/useIsClient";
import { memo } from "react";

interface Track {
  title: string;
  artist: string;
  progress: number;
  duration: number;
}

type ErrorLine = {
  id: string;
  message: string;
  timestamp: Date;
  type: "error" | "warning";
  line?: string;
  key?: string;
};

// Add type for graph data
type GraphMetric = {
  time: number;
  apiHits: number;
  latency: number;
  errors: number;
  memory: number;
};

const ClientOnlyTime = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // if (!isMounted) {
  //   return <span>Loading...</span>;
  // }

  return <>{children}</>;
};

// Update the hook to accept isSessionActive
const usePingFormatter = (isSessionActive: boolean) => {
  const isClient = useIsClient();

  return useCallback(
    (lastPing: number | null) => {
      if (!isClient) return "Loading...";
      if (!isSessionActive) return "Session Inactive";
      if (!lastPing) return "Waiting...";

      const diff = Date.now() - lastPing;
      if (diff < 1000) return `${diff}ms`;
      if (diff < 60000) return `${Math.round(diff / 1000)}s ago`;
      return `${Math.round(diff / 60000)}m ago`;
    },
    [isClient, isSessionActive]
  );
};

// Update the PingDisplay component to accept isSessionActive
const PingDisplay = ({
  lastPing,
  isSessionActive,
}: {
  lastPing: number | null;
  isSessionActive: boolean;
}) => {
  const isClient = useIsClient();

  if (!isClient) return <span>Loading...</span>;
  if (!isSessionActive) return <span>Session Inactive</span>;
  if (!lastPing) return <span>Waiting...</span>;

  const diff = Date.now() - lastPing;
  if (diff < 1000) return <span>{diff}ms</span>;
  if (diff < 60000) return <span>{Math.round(diff / 1000)}s ago</span>;
  return <span>{Math.round(diff / 60000)}m ago</span>;
};

// Memoize the time display component
const TimeDisplay = memo(({ time }: { time: Date }) => (
  <span className="opacity-50 shrink-0">{time.toLocaleTimeString()}</span>
));
TimeDisplay.displayName = "TimeDisplay";

// Memoize the console message component
const ConsoleMessage = memo(
  ({
    msg,
  }: {
    msg: {
      id: string;
      message: string;
      timestamp: Date;
      type: "info" | "success" | "error";
      details?: Record<string, any>;
    };
  }) => (
    <div
      className={cn(
        "text-xs font-mono flex flex-col gap-1",
        msg.type === "error" && "text-red-400",
        msg.type === "success" && "text-emerald-400",
        msg.type === "info" && "text-blue-400"
      )}
    >
      <div className="flex items-start gap-2">
        <TimeDisplay time={msg.timestamp} />
        <span className="break-all">{msg.message}</span>
      </div>
      {msg.details && (
        <div className="ml-[85px] text-[10px] opacity-70 space-y-0.5 font-mono">
          {Object.entries(msg.details).map(([key, value]) => (
            <div key={key} className="whitespace-pre">
              {key}: {formatConsoleValue(value)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
);
ConsoleMessage.displayName = "ConsoleMessage";

// Memoize the console output component
const ConsoleOutput = memo(() => {
  const { consoleMessages, clearConsoleMessages } = useConsoleMessages();

  return (
    <div className="col-span-2 space-y-2">
      <h3 className="text-xs font-medium text-muted-foreground flex items-center justify-between">
        Real-time Console
        <Button
          variant="ghost"
          size="sm"
          onClick={clearConsoleMessages}
          className="h-4 px-2 text-xs"
        >
          Clear
        </Button>
      </h3>
      <div className="space-y-1 max-h-[80px] overflow-y-auto scrollbar-thin dark:bg-black/20 bg-white/20 rounded-md p-2">
        {consoleMessages.map((msg) => (
          <ConsoleMessage key={msg.id} msg={msg} />
        ))}
      </div>
    </div>
  );
});
ConsoleOutput.displayName = "ConsoleOutput";

// Memoize the performance graph
const PerformanceGraph = memo(() => {
  const {
    apiHits,
    latency,
    sessionErrors,
    sessionStartTime,
    formatUptime,
    formatConsoleValue,
    createPath,
  } = useElysiaSessionContext();

  // Convert sessionErrors to GraphMetric format
  const graphData: GraphMetric[] = sessionErrors.map((error) => ({
    time: error.timestamp.getTime(),
    apiHits: apiHits,
    latency: latency || 0,
    errors: sessionErrors.length,
    memory:
      typeof window !== "undefined"
        ? // @ts-ignore - Chrome only
          (performance?.memory?.usedJSHeapSize || 0) / 1024 / 1024 / 200
        : 0,
  }));

  return (
    <div className="col-span-2 space-y-2">
      <h3 className="text-xs font-medium text-muted-foreground flex items-center justify-between">
        Performance Graph
        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span>API Hits</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Latency</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Errors</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Memory</span>
          </div>
        </div>
      </h3>
      <div className="h-[80px] bg-black/20 rounded-md relative overflow-hidden">
        {/* Y-axis markers */}
        <div className="absolute left-0 top-0 h-full w-8 flex flex-col justify-between text-[9px] text-muted-foreground py-1 px-1">
          <span>60</span>
          <span>30</span>
          <span>0</span>
        </div>
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-full h-px bg-muted-foreground/10" />
          ))}
        </div>
        {/* Time markers */}
        <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[9px] text-muted-foreground px-2">
          <span>-60s</span>
          <span>-30s</span>
          <span>now</span>
        </div>
        <svg
          className="w-full h-full pl-8 pb-4"
          viewBox="0 0 100 75"
          preserveAspectRatio="none"
        >
          <defs>
            <clipPath id="graph-clip">
              <rect x="0" y="0" width="100" height="75" />
            </clipPath>
          </defs>
          <g clipPath="url(#graph-clip)">
            {sessionErrors.length > 1 && (
              <>
                {/* Grid vertical lines */}
                {[25, 50, 75].map((x) => (
                  <line
                    key={x}
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={75}
                    stroke="currentColor"
                    strokeOpacity="0.1"
                    strokeDasharray="2 2"
                  />
                ))}

                {/* API Hits line */}
                <path
                  d={createPath(sessionErrors, "apiHits")}
                  stroke="rgb(147, 51, 234)"
                  strokeWidth="1.5"
                  fill="none"
                />

                {/* Latency line */}
                <path
                  d={createPath(sessionErrors, "latency")}
                  stroke="rgb(59, 130, 246)"
                  strokeWidth="1.5"
                  fill="none"
                  strokeDasharray="4 2"
                />

                {/* Error line */}
                <path
                  d={createPath(sessionErrors, "errors")}
                  stroke="rgb(239, 68, 68)"
                  strokeWidth="1.5"
                  fill="none"
                />

                {/* Memory line */}
                <path
                  d={createPath(sessionErrors, "memory")}
                  stroke="rgb(34, 197, 94)"
                  strokeWidth="1.5"
                  fill="none"
                  strokeDasharray="2 2"
                />

                {/* Current value dots */}
                {sessionErrors.length > 0 && (
                  <g>
                    {Object.entries({
                      apiHits: "rgb(147, 51, 234)",
                      latency: "rgb(59, 130, 246)",
                      errors: "rgb(239, 68, 68)",
                      memory: "rgb(34, 197, 94)",
                    }).map(([key, color]) => (
                      <circle
                        key={key}
                        cx={100}
                        cy={
                          75 -
                          sessionErrors[sessionErrors.length - 1][
                            key as keyof GraphMetric
                          ] *
                            75
                        }
                        r="2"
                        fill={color}
                        className="animate-pulse"
                      />
                    ))}
                  </g>
                )}
              </>
            )}
          </g>
        </svg>
        {/* Current values tooltip */}
        {sessionErrors.length > 0 && (
          <div className="absolute right-2 top-2 text-[10px] font-medium bg-black/40 px-2 space-y-0">
            <div className="text-purple-400">
              {Math.round(sessionErrors[sessionErrors.length - 1].apiHits * 60)}{" "}
              hits/min
            </div>
            <div className="text-blue-400">
              {Math.round(
                sessionErrors[sessionErrors.length - 1].latency * 200
              )}
              ms
            </div>
            <div className="text-red-400">
              {Math.round(sessionErrors[sessionErrors.length - 1].errors * 5)}{" "}
              errors
            </div>
            <div className="text-emerald-400">
              {Math.round(sessionErrors[sessionErrors.length - 1].memory * 200)}
              MB
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
PerformanceGraph.displayName = "PerformanceGraph";

// Memoize the system stats
const SystemStats = memo(() => {
  const { sessionStartTime, sessionStatus, sessionErrors, formatUptime } =
    useElysiaSessionContext();

  return (
    <div className="col-span-2 grid grid-cols-4 gap-2">
      <div
        className={cn(
          "rounded p-2 text-center",
          "bg-gradient-to-br from-emerald-500/10 to-emerald-500/5",
          "border border-emerald-500/20"
        )}
      >
        <div className="text-xs font-medium text-emerald-400">Memory</div>
        <div className="text-sm">
          {typeof window !== "undefined" &&
          // @ts-ignore - performance.memory exists in Chrome
          performance?.memory?.usedJSHeapSize
            ? Math.round(
                // @ts-ignore
                performance.memory.usedJSHeapSize / 1024 / 1024
              ) + "MB"
            : "N/A"}
        </div>
      </div>
      <div
        className={cn(
          "rounded p-2 text-center",
          "bg-gradient-to-br from-blue-500/10 to-blue-500/5",
          "border border-blue-500/20"
        )}
      >
        <div className="text-xs font-medium text-blue-400">Latency</div>
        <div className="text-sm">
          {sessionStatus.spotify.latency !== null
            ? `${sessionStatus.spotify.latency}ms`
            : "N/A"}
        </div>
      </div>
      <div
        className={cn(
          "rounded p-2 text-center",
          "bg-gradient-to-br from-purple-500/10 to-purple-500/5",
          "border border-purple-500/20"
        )}
      >
        <div className="text-xs font-medium text-purple-400">Uptime</div>
        <div className="text-sm">{formatUptime(sessionStartTime)}</div>
      </div>
      <div
        className={cn(
          "rounded p-2 text-center",
          "bg-gradient-to-br from-red-500/10 to-red-500/5",
          "border border-red-500/20",
          sessionErrors.length > 0 && "animate-pulse"
        )}
      >
        <div className="text-xs font-medium text-red-400">Errors</div>
        <div className="text-sm flex items-center justify-center gap-1">
          <span>{sessionErrors.length}</span>
          {sessionErrors.length > 0 && (
            <AlertTriangle className="h-3 w-3 text-red-400" />
          )}
        </div>
      </div>
    </div>
  );
});
SystemStats.displayName = "SystemStats";

// Memoize the API stats
const ApiStats = memo(() => {
  const { apiHits, latency, sessionErrors } = useElysiaSessionContext();

  const getApiHitColor = (hits: number) => {
    const percentage = (hits / 60) * 100;
    if (percentage < 50) return "text-emerald-400";
    if (percentage < 75) return "text-yellow-300";
    return "text-pink-500";
  };

  return (
    <div className="col-span-2 space-y-2">
      <h3 className="text-xs font-medium text-muted-foreground">API Usage</h3>
      <div className="space-y-1 text-xs">
        <p>
          Hits (60s):{" "}
          <span className={cn("font-bold", getApiHitColor(apiHits))}>
            {apiHits}/60
          </span>
        </p>
        {/* <ClientOnlyTime>
          <p className="text-cyan-300">
            Updated: {lastApiUpdate?.toLocaleTimeString()}
          </p>
        </ClientOnlyTime> */}
        {apiHits > 45 && (
          <div className="mt-2 flex items-center gap-1 rounded bg-red-500/20 px-2 py-1 text-red-400">
            <AlertTriangle className="h-3 w-3" />
            <span>High API Usage</span>
          </div>
        )}
      </div>
    </div>
  );
});
ApiStats.displayName = "ApiStats";

// Memoize the error log
const ErrorLog = memo(() => {
  const { sessionErrors, clearSessionErrors } = useElysiaSessionContext();

  return (
    sessionErrors.length > 0 && (
      <div className="col-span-2 space-y-2">
        <h3 className="text-xs font-medium text-muted-foreground flex items-center justify-between">
          Session Logs
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSessionErrors}
            className="h-4 px-2 text-xs"
          >
            Clear
          </Button>
        </h3>
        <div className="space-y-1 max-h-[100px] overflow-y-auto scrollbar-thin">
          {sessionErrors.map((error) => (
            <div
              key={error.id}
              className={cn(
                "text-xs px-2 py-1 rounded flex items-start gap-2",
                error.type === "error"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-yellow-500/10 text-yellow-400"
              )}
            >
              <span className="mt-0.5">
                {error.type === "error" ? (
                  <AlertTriangle className="h-3 w-3" />
                ) : (
                  <AlertCircle className="h-3 w-3" />
                )}
              </span>
              <div className="flex-1 space-y-0.5">
                <p className="font-medium">{error.message}</p>
                {(error.line || error.key) && (
                  <div className="text-[10px] opacity-70 space-x-2">
                    {error.key && <span>Key: {error.key}</span>}
                    {error.line && <span>Line: {error.line}</span>}
                  </div>
                )}
                <ClientOnlyTime>
                  <p className="text-[10px] opacity-70">
                    {error.timestamp.toLocaleTimeString()}
                  </p>
                </ClientOnlyTime>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  );
});
ErrorLog.displayName = "ErrorLog";

// Create a custom hook for console messages
const useConsoleMessages = () => {
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      message: string;
      timestamp: Date;
      type: "info" | "success" | "error";
      details?: Record<string, any>;
    }>
  >([]);

  const addMessage = useCallback(
    (
      message: string,
      type: "info" | "success" | "error" = "info",
      details?: Record<string, any>
    ) => {
      setMessages((prev) => [
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

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    consoleMessages: messages,
    addConsoleMessage: addMessage,
    clearConsoleMessages: clearMessages,
  };
};

export function ElysiaSessionManager() {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    isSessionActive,
    isServerAvailable,
    lastPing,
    apiStats,
    nowPlaying,
    twitchToken,
    handleToggleSession,
    sessionStatus,
    sessionStartTime,
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
  } = useElysiaSessionContext();
  const { userId, sessionId, getToken } = useAuth();
  const { spotifyRefreshToken } = useSpotifyStore();
  const [isToggling, setIsToggling] = useState(false);
  const [isVerifyingSpotify, setIsVerifyingSpotify] = useState(false);
  const { oauthTokens } = useOAuthStore();
  const spotifyOAuthToken = oauthTokens?.spotify?.refreshToken;
  const [lastApiUpdate, setLastApiUpdate] = useState<Date | null>(null);
  const [currentPing, setCurrentPing] = useState<number | null>(null);

  const formatPingTime = usePingFormatter(isSessionActive);

  useEffect(() => {
    setLastApiUpdate(new Date());
  }, []);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const truncateUserId = (id: string | null) => {
    if (!id) return "Missing";
    return `${id.slice(0, 6)}...${id.slice(-4)}`;
  };

  const StatusIndicator = ({
    isPresent,
    label,
  }: {
    isPresent: boolean;
    label: string;
  }) => (
    <span
      className={cn("ml-2", isPresent ? "text-emerald-400" : "text-pink-500")}
    >
      {label}
    </span>
  );

  const isApiUsageHigh = apiStats && apiStats.apiHits > 45;

  const handleSessionToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      await handleToggleSession();
    } finally {
      setTimeout(() => setIsToggling(false), 1000);
    }
  };

  const verifySpotifyConnection = async () => {
    if (!spotifyOAuthToken || !isSessionActive) {
      console.log("Skipping verification:", {
        hasToken: !!spotifyOAuthToken,
        isSessionActive,
        sessionId,
      });
      return;
    }

    setIsVerifyingSpotify(true);
    try {
      const clerkToken = await getToken({ template: "lstio" });
      const apiUrl = import.meta.env.VITE_ELYSIA_API_URL;
      if (!apiUrl) {
        throw new Error("VITE_ELYSIA_API_URL environment variable is not set");
      }

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
      console.log("Verification response:", data);
      setIsSpotifyVerified(data.success && data.spotify?.isConnected);
    } catch (error) {
      console.error("Failed to verify Spotify connection:", error);
      setIsSpotifyVerified(false);
    } finally {
      setIsVerifyingSpotify(false);
    }
  };

  useEffect(() => {
    console.log("Effect triggered:", {
      isSessionActive,
      spotifyOAuthToken,
      shouldVerify: isSessionActive && spotifyOAuthToken,
      sessionResponse: isSessionActive ? "Session Active" : "No Session",
    });

    if (isSessionActive && spotifyOAuthToken) {
      verifySpotifyConnection();
    } else {
      setIsSpotifyVerified(false);
    }
  }, [isSessionActive, spotifyOAuthToken]);

  const getSpotifyStatus = () => {
    if (isVerifyingSpotify) return "Verifying...";
    if (!isSessionActive) return "Session Inactive";
    if (isSpotifyVerified) return "Connected";
    if (spotifyOAuthToken) return "Token Invalid";
    return "Not Connected";
  };

  useEffect(() => {
    if (!isSessionActive) return;

    const updateApiStats = async () => {
      try {
        const clerkToken = await getToken({ template: "lstio" });
        const apiUrl = import.meta.env.VITE_ELYSIA_API_URL;

        if (!apiUrl || !clerkToken || !userId) {
          throw new Error("Missing required configuration");
        }

        console.log("Fetching stats from:", `${apiUrl}/api/spotify/api-stats`);

        const response = await fetch(`${apiUrl}/api/spotify/api-stats`, {
          headers: {
            Authorization: `Bearer ${clerkToken}`,
            "X-User-Id": userId,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          const text = await response.text();
          console.error("API Response:", {
            status: response.status,
            text,
            headers: Object.fromEntries(response.headers.entries()),
          });
          throw new Error(`Failed to fetch API stats: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setApiHits(data.stats.hits || 0);
          setLastApiUpdate(new Date());
        }
      } catch (error) {
        console.error("Failed to fetch API stats:", error);
      }
    };

    updateApiStats();
    const interval = setInterval(updateApiStats, 10000);
    return () => clearInterval(interval);
  }, [isSessionActive, sessionId, getToken, userId]);

  useEffect(() => {
    if (isSessionActive) {
      const verifyTokens = async () => {
        try {
          const clerkToken = await getToken({ template: "lstio" });
          const apiUrl = import.meta.env.VITE_ELYSIA_API_URL;
          if (!apiUrl) {
            throw new Error(
              "VITE_ELYSIA_API_URL environment variable is not set"
            );
          }

          const response = await fetch(`${apiUrl}/api/session/status`, {
            headers: {
              Authorization: `Bearer ${clerkToken}`,
              "X-User-Id": userId || "",
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to verify session: ${response.status}`);
          }

          const data = await response.json();
          console.log("Session status:", data);

          if (data.success && data.spotify?.isConnected) {
            setIsSpotifyVerified(true);
          }
        } catch (error) {
          console.error("Failed to verify session status:", error);
          addSessionError(
            error instanceof Error
              ? error.message
              : "Session verification failed"
          );
        }
      };

      verifyTokens();
    } else {
      setIsSpotifyVerified(false);
      setApiHits(0);
    }
  }, [isSessionActive, sessionId, getToken, userId]);

  useEffect(() => {
    if (!isSessionActive) {
      setCurrentPing(null);
      return;
    }

    const updatePing = () => {
      setCurrentPing(Date.now());
    };

    updatePing();

    const interval = setInterval(updatePing, 1000);
    return () => clearInterval(interval);
  }, [isSessionActive]);

  useEffect(() => {
    if (!isSessionActive) return;

    const prevSpotify = sessionStatus.spotify.isConnected;
    const prevTwitch = sessionStatus.twitch.isConnected;
    const currentSpotify = !!spotifyOAuthToken && isSpotifyVerified;
    const currentTwitch = !!twitchToken;

    if (prevSpotify !== currentSpotify) {
      addConsoleMessage(
        `Spotify ${currentSpotify ? "connected" : "disconnected"}`,
        currentSpotify ? "success" : "info",
        {
          token: !!spotifyOAuthToken,
          verified: isSpotifyVerified,
          timestamp: new Date().toLocaleTimeString(),
        }
      );
    }

    if (prevTwitch !== currentTwitch) {
      addConsoleMessage(
        `Twitch ${currentTwitch ? "connected" : "disconnected"}`,
        currentTwitch ? "success" : "info",
        {
          token: !!twitchToken,
          timestamp: new Date().toLocaleTimeString(),
        }
      );
    }
  }, [
    isSessionActive,
    sessionStatus,
    spotifyOAuthToken,
    twitchToken,
    isSpotifyVerified,
  ]);

  useEffect(() => {
    if (!isSessionActive) return;

    const updateStatus = () => {
      addConsoleMessage("Status update", "info", {
        connections: {
          spotify: {
            connected: sessionStatus.spotify.isConnected,
            token: !!spotifyOAuthToken,
            verified: isSpotifyVerified,
          },
          twitch: {
            connected: sessionStatus.twitch.isConnected,
            token: !!twitchToken,
          },
        },
        stats: {
          apiHits,
          latency: latency ? `${latency}ms` : "N/A",
          uptime: formatUptime(sessionStartTime),
        },
      });
    };

    const interval = setInterval(updateStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [
    isSessionActive,
    sessionStatus,
    spotifyOAuthToken,
    twitchToken,
    isSpotifyVerified,
    apiHits,
    latency,
    sessionStartTime,
  ]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-2 w-[min(400px,calc(100vw-2rem))]"
          >
            <div className="rounded-lg m-1 shadow-innerm-[1px] border bg-background/50 p-4 shadow-lg backdrop-blur-2xl">
              <div className="space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold">Session Manager</h2>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        isServerAvailable
                          ? isSessionActive
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      )}
                    >
                      {isServerAvailable
                        ? isSessionActive
                          ? "Online"
                          : "Offline"
                        : "Unavailable"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                    className="h-auto p-1"
                  >
                    <CircleX className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Connections */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-medium text-muted-foreground">
                      Connections
                    </h3>
                    <div className="space-y-1">
                      <p className="flex items-center text-xs">
                        <span className="mr-1 h-3 w-3 text-purple-400">
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            height="1em"
                            width="1em"
                          >
                            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                          </svg>
                        </span>
                        Twitch:
                        <StatusIndicator
                          isPresent={!!twitchToken}
                          label={twitchToken ? "Connected" : "Not Connected"}
                        />
                      </p>
                      <p className="flex items-center text-xs">
                        <span className="mr-1 h-3 w-3 text-green-400">
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            height="1em"
                            width="1em"
                          >
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                          </svg>
                        </span>
                        Spotify:
                        <StatusIndicator
                          isPresent={isSpotifyVerified}
                          label={getSpotifyStatus()}
                        />
                      </p>
                    </div>
                  </div>

                  {/* Session Info */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-medium text-muted-foreground">
                      Session
                    </h3>
                    <div className="space-y-1 text-xs">
                      <p>
                        User ID:{" "}
                        <span className="text-yellow-300">
                          {truncateUserId(userId || null)}
                        </span>
                      </p>
                      <p>
                        Session:{" "}
                        <span
                          className={
                            sessionId ? "text-emerald-400" : "text-pink-500"
                          }
                        >
                          {sessionId ? "Active" : "Inactive"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Console Output */}
                  <ConsoleOutput />

                  {/* Performance Graph */}
                  <PerformanceGraph />

                  {/* Now Playing */}
                  {nowPlaying?.track &&
                    typeof nowPlaying.track === "object" &&
                    "title" in nowPlaying.track && (
                      <div className="col-span-2 space-y-2">
                        <h3 className="text-xs font-medium text-muted-foreground">
                          Now Playing
                        </h3>
                        <div className="space-y-1 text-xs">
                          <p className="truncate text-yellow-300">
                            {(nowPlaying.track as Track).title}
                          </p>
                          <p className="truncate text-cyan-300">
                            {(nowPlaying.track as Track).artist}
                          </p>
                          <p className="text-emerald-400">
                            {Math.floor(
                              (nowPlaying.track as Track).progress / 1000
                            )}
                            s/
                            {Math.floor(
                              (nowPlaying.track as Track).duration / 1000
                            )}
                            s
                          </p>
                        </div>
                      </div>
                    )}

                  {/* System Stats */}
                  <SystemStats />

                  {/* API Stats */}
                  <ApiStats />

                  {/* Error Log */}
                  <ErrorLog />

                  {/* Actions */}
                  <div className="col-span-2">
                    <Button
                      onClick={handleSessionToggle}
                      size="sm"
                      variant={isSessionActive ? "destructive" : "default"}
                      className="w-full"
                      disabled={isToggling}
                    >
                      {isToggling ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {isSessionActive ? "Stopping..." : "Starting..."}
                        </span>
                      ) : isSessionActive ? (
                        "Stop Session"
                      ) : (
                        "Start Session"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "relative h-10 w-10 rounded-full shadow-lg backdrop-blur-sm",
          "bg-violet-500/10 hover:bg-violet-500/20",
          "border border-violet-500/20 hover:border-violet-500/30",
          "transition-all duration-200",
          isExpanded && "ring-2",
          isExpanded &&
            (isServerAvailable
              ? isSessionActive
                ? "ring-emerald-500/50"
                : "ring-yellow-500/50"
              : "ring-red-500/50")
        )}
      >
        <BrandElysia
          className={cn(
            "!h-7 !w-7",
            isServerAvailable
              ? isSessionActive
                ? "fill-emerald-500"
                : "fill-yellow-500"
              : "fill-red-500",
            "transition-colors duration-200",
            isExpanded && "rotate-180"
          )}
        />
        <IconBadge
          status={
            isServerAvailable
              ? isSessionActive
                ? "success"
                : "warning"
              : "error"
          }
          showStatusIcon
          size="sm"
          position="top-right"
        />
      </Button>
    </div>
  );
}
