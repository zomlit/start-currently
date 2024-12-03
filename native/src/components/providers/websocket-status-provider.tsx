"use client";
import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useEffect,
  useRef,
} from "react";
import useWebSocket from "../hooks/use-websocket";

// Defining the type for the context
type WebSocketStatus = {
  connected: boolean;
  on: boolean;
  disable: Function;
  enable: Function;
  waitingToReconnect: boolean;
  reconnecting: boolean;
  toggleConnection: Function;
};

// Creating the WebSocket context with an initial value of null
const WebSocketStatusContext = createContext<WebSocketStatus | undefined>(
  undefined
);

type WebSocketStatusProviderProps = {
  children: ReactNode;
};

// Provider component
export const WebSocketStatusProvider: React.FC<
  WebSocketStatusProviderProps
> = ({ children }) => {
  const socketRef = useRef<WebSocket | null>(null);
  const { connected, disable, enable, on, waitingToReconnect, reconnecting } =
    useWebSocket(49322);

  const toggleConnection = () => {
    if (on) {
      disable();
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    } else {
      enable();
    }
  };

  useEffect(() => {
    if (on && !socketRef.current) {
      socketRef.current = new WebSocket("ws://localhost:49322");

      socketRef.current.onopen = () => {
        console.log("WebSocket connected");
      };

      socketRef.current.onmessage = (event) => {
        // Handle incoming messages
        console.log("WebSocket message received:", event.data);
        // You might want to dispatch this message to a global event system
        window.postMessage(event.data, "*");
      };

      socketRef.current.onclose = () => {
        console.log("WebSocket disconnected");
        socketRef.current = null;
      };
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [on]);

  const status = useMemo(() => {
    return {
      connected,
      disable,
      enable,
      on,
      waitingToReconnect,
      reconnecting,
      toggleConnection,
    };
  }, [connected, disable, enable, on, reconnecting, waitingToReconnect]);

  return (
    <WebSocketStatusContext.Provider value={status}>
      {children}
    </WebSocketStatusContext.Provider>
  );
};

// Hook to use WebSocket status in other components
export const useWebSocketStatus = (): WebSocketStatus | null => {
  const context = useContext(WebSocketStatusContext);
  if (context === undefined) {
    throw new Error(
      "useWebSocketStatus must be used within a WebSocketStatusProvider"
    );
  }
  return context;
};
