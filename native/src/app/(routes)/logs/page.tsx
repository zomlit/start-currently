"use client";
import React, { useEffect, useRef, useState } from "react";
import { useWebSocketStatus } from "@/components/providers/websocket-status-provider";

const GAME_OVERLAY_SOCKET_URL = "ws://localhost:49122";

const Logs = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messageLogs, setMessageLogs] = useState<{
    [key: string]: { timestamp: string; event: string; data: any };
  }>({});
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [rocketLeagueConnected, setRocketLeagueConnected] = useState(false);
  const [lastSosVersion, setLastSosVersion] = useState<string | null>(null);
  const [hadInitialConnection, setHadInitialConnection] = useState(false);
  const status = useWebSocketStatus();

  const getWebSocketStatusMessage = (status) => {
    if (status.connected) return "WebSocket Server is Connected";
    if (status.reconnecting) return "Reconnecting to WebSocket Server";
    if (status.waitingToReconnect)
      return `Waiting to ${status.on ? "Reconnect" : "Disconnect"}`;
    return "WebSocket Server is Disconnected";
  };

  const colorizeJson = (json: string) => {
    if (typeof json !== "string") {
      json = JSON.stringify(json, null, 2);
    }
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "text-green-400"; // string
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "text-purple-400"; // key
          }
        } else if (/true|false/.test(match)) {
          cls = "text-yellow-400"; // boolean
        } else if (/null/.test(match)) {
          cls = "text-red-400"; // null
        } else {
          cls = "text-blue-400"; // number
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  const connectWebSocket = () => {
    const socket = new WebSocket(GAME_OVERLAY_SOCKET_URL);

    socket.onopen = () => {
      console.log("WebSocket connection established to port 49122");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        console.log("Received WebSocket message on port 49122:", message);

        setMessageLogs((prev) => {
          const { noConnection, ...rest } = prev;
          return {
            ...rest,
            [message.event]: {
              timestamp: new Date().toLocaleString(),
              event: message.event,
              data: message.data,
            },
          };
        });

        setRocketLeagueConnected(true);
        setHadInitialConnection(true);

        if (message.event === "sos:version") {
          console.log("SOS Version:", message.data);
          setLastSosVersion(message.data);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error on port 49122:", error);
      setRocketLeagueConnected(false);
      if (!hadInitialConnection) {
        setMessageLogs({
          noConnection: {
            timestamp: new Date().toLocaleString(),
            event: "No event data, Open Rocket League",
            data: "No data",
          },
        });
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed for port 49122");
      setIsConnected(false);
      setRocketLeagueConnected(false);
      setLastSosVersion(null);

      if (hadInitialConnection) {
        setMessageLogs((prevLogs) => ({
          ...prevLogs,
          disconnection: {
            timestamp: new Date().toLocaleString(),
            event: "disconnection",
            data: "WebSocket connection was destroyed.",
          },
        }));
      }

      setHadInitialConnection(false);

      setTimeout(connectWebSocket, 5000);
    };

    socketRef.current = socket;
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messageLogs, autoScroll]);

  const handleScroll = () => {
    if (logsContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        logsContainerRef.current;
      const isScrolledToBottom = scrollHeight - scrollTop === clientHeight;
      setAutoScroll(isScrolledToBottom);
    }
  };

  return (
    <div className="bg-black text-white font-mono p-4 h-full overflow-hidden flex flex-col">
      <div className="flex items-center mb-2">
        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
      </div>
      <div
        ref={logsContainerRef}
        onScroll={handleScroll}
        className="flex-grow overflow-y-auto"
      >
        {Object.entries(messageLogs).map(([key, log]) => (
          <div key={key} className="mb-4 border-b border-gray-700 pb-2">
            <div className="text-blue-400">
              [{log.timestamp}] Event: {log.event}
            </div>
            <pre
              className="whitespace-pre-wrap overflow-x-auto"
              dangerouslySetInnerHTML={{
                __html:
                  typeof log.data === "string"
                    ? log.data
                    : colorizeJson(log.data),
              }}
            />
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};

export default Logs;
