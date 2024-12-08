import React, { createContext, useContext, useState, useCallback } from "react";
import { edenTreaty } from "@elysiajs/eden";
import type { App } from "@currently/backend/src/types";
import { toast } from "sonner";

if (!import.meta.env.VITE_ELYSIA_API_URL) {
  throw new Error("VITE_ELYSIA_API_URL environment variable is not set");
}

const edenClient = edenTreaty<App>(import.meta.env.VITE_ELYSIA_API_URL);

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
  client: typeof edenClient;
};

export const ElysiaSessionContext =
  createContext<ElysiaSessionContextType | null>(null);

export const ElysiaSessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isServerAvailable, setIsServerAvailable] = useState(false);
  const [lastPing, setLastPing] = useState<number | null>(null);
  const [apiStats, setApiStats] = useState<any>(null);
  const [nowPlaying, setNowPlaying] = useState<any>(null);
  const [twitchToken, setTwitchToken] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [apiHits, setApiHits] = useState(0);
  const [latency, setLatency] = useState<number | null>(null);
  const [sessionErrors, setSessionErrors] = useState<ErrorLine[]>([]);
  const [isSpotifyVerified, setIsSpotifyVerified] = useState(false);

  const sessionStatus = {
    spotify: {
      isConnected: false,
      lastChecked: null,
      latency: null,
    },
    twitch: {
      isConnected: false,
      lastChecked: null,
    },
  };

  const handleToggleSession = async () => {
    // Implementation here
  };

  const formatUptime = useCallback((startTime: number | null) => {
    // Implementation here
    return "";
  }, []);

  const formatConsoleValue = (value: any) => {
    // Implementation here
    return "";
  };

  const getApiHitColor = (hits: number) => {
    // Implementation here
    return "";
  };

  const addConsoleMessage = (
    message: string,
    type: "info" | "success" | "error" = "info",
    details?: Record<string, any>
  ) => {
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      default:
        toast.info(message);
    }
  };

  const clearConsoleMessages = () => {
    // Implementation here
  };

  const value = {
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
    client: edenClient,
  };

  return (
    <ElysiaSessionContext.Provider value={value}>
      {children}
    </ElysiaSessionContext.Provider>
  );
};

export const useElysiaSession = () => {
  const context = useContext(ElysiaSessionContext);
  if (!context) {
    throw new Error(
      "useElysiaSession must be used within an ElysiaSessionProvider"
    );
  }
  return context;
};

export const useElysiaSessionContext = useElysiaSession;
