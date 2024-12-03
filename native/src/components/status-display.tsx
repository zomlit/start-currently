"use client";
import React, { useState, useEffect, useRef } from "react";
import { useWebSocketStatus } from "@/components/providers/websocket-status-provider";

const GAME_OVERLAY_SOCKET_URL = "ws://localhost:49122";

const StatusDisplay: React.FC = () => {
  const status = useWebSocketStatus();
  const [rocketLeagueConnected, setRocketLeagueConnected] = useState(false);
  const [lastSosVersion, setLastSosVersion] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const connectWebSocket = () => {
    const socket = new WebSocket(GAME_OVERLAY_SOCKET_URL);

    socket.onopen = () => {
      console.log("WebSocket connection established to port 49122");
      setRocketLeagueConnected(false); // Reset connection status on new connection
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.event === "sos:version") {
          console.log("SOS Version:", message.data);
          setLastSosVersion(message.data);
          setRocketLeagueConnected(true);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed for port 49122");
      setRocketLeagueConnected(false);
      setLastSosVersion(null);
      setTimeout(connectWebSocket, 5000); // Attempt to reconnect after 5 seconds
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

  if (!status) {
    return null;
  }

  const getWebSocketStatusMessage = (status) => {
    if (status.connected) return "WebSocket Server is Connected";
    if (status.reconnecting) return "Reconnecting to WebSocket Server";
    if (status.waitingToReconnect)
      return `Waiting to ${status.on ? "Reconnect" : "Disconnect"}`;
    return "WebSocket Server is Disconnected";
  };

  return (
    <div className="flex flex-col m-2">
      <div className="flex items-center">
        <div
          className={`w-3 h-3 rounded-full mr-2 ${
            status.connected
              ? "bg-green-500"
              : status.reconnecting || status.waitingToReconnect
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
        ></div>
        <div className="text-white">{getWebSocketStatusMessage(status)}</div>
      </div>
      <div className="flex items-center mt-2">
        <div
          className={`w-3 h-3 rounded-full mr-2 ${
            rocketLeagueConnected ? "bg-green-500" : "bg-yellow-500"
          }`}
        ></div>
        <div className="text-white">
          {rocketLeagueConnected
            ? `Connected to Rocket League on port 49122 (SOS version: ${lastSosVersion})`
            : "Waiting for Rocket League connection on port 49122"}
        </div>
      </div>
    </div>
  );
};

export default StatusDisplay;
