import React, { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { WidgetLayout } from "@/components/layouts/WidgetLayout";
import ChatSettingsForm from "@/components/widget-settings/ChatSettingsForm";
import { useChatStore } from "@/store/useChatStore";
import { useUser } from "@clerk/tanstack-start";
import {
  DefaultChatSkin,
  CompactChatSkin,
  BubbleChatSkin,
} from "@/components/skins/chat";
import { toast } from "@/utils/toast";

export const Route = createFileRoute("/_app/widgets/chat")({
  component: ChatSection,
});

function ChatSection() {
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const {
    messages,
    connect,
    disconnect,
    isConnected,
    fetchInitialMessages,
    setMessages,
  } = useChatStore();

  const [settings, setSettings] = useState({
    backgroundColor: "#ffffff", // Default values
    textColor: "#000000",
    fontFamily: "Arial",
    fontSize: 16,
    opacity: 100,
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [hasLoadedInitialMessages, setHasLoadedInitialMessages] =
    useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const renderChatSkin = useCallback(() => {
    const props = {
      messages,
      textColor: settings.textColor,
      backgroundColor: settings.backgroundColor,
      chatBubbleColor: settings.chatBubbleColor,
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize}px`,
      fontWeight: settings.fontWeight,
      lineHeight: settings.lineHeight,
      letterSpacing: settings.letterSpacing,
      textAlign: settings.textAlign,
      textTransform: settings.textTransform,
      textDecoration: settings.textDecoration,
      fontStyle: settings.fontStyle,
      wordSpacing: settings.wordSpacing,
      textIndent: settings.textIndent,
      padding: settings.padding,
      borderColor: settings.borderColor,
      borderWidth: settings.borderWidth,
      borderStyle: settings.borderStyle,
      borderRadius: settings.borderRadius,
      showAvatars: settings.showAvatars,
      showBadges: settings.showBadges,
      showPlatform: settings.showPlatform,
    };

    switch (settings.chatSkin) {
      case "compact":
        return <CompactChatSkin {...props} />;
      case "bubble":
        return <BubbleChatSkin {...props} />;
      default:
        return <DefaultChatSkin {...props} />;
    }
  }, [settings, messages]);

  if (!isUserLoaded || !isSignedIn) {
    return <div>Please sign in to use the chat widget.</div>;
  }

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [messages, autoScroll, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [settings, scrollToBottom]);

  useEffect(() => {
    const loadInitialMessages = async () => {
      if (settings.broadcastChannel && !hasLoadedInitialMessages) {
        try {
          console.log(
            "Attempting to fetch initial messages for channel:",
            settings.broadcastChannel
          );
          await fetchInitialMessages(settings.broadcastChannel);
          console.log("[ChatWidget] Initial messages loaded successfully");
          setHasLoadedInitialMessages(true);
        } catch (error) {
          console.error("[ChatWidget] Error loading initial messages:", error);
          toast.error({
            title: "Failed to load initial messages",
          });
        }
      }
    };

    loadInitialMessages();
  }, [settings, fetchInitialMessages, hasLoadedInitialMessages]);

  useEffect(() => {
    const setupChat = async () => {
      if (
        isUserLoaded &&
        isSignedIn &&
        user?.id &&
        settings.broadcastChannel &&
        settings.selectedUsernameToken &&
        !isConnected
      ) {
        console.log("[ChatWidget] Attempting to connect to chat", {
          broadcastChannel: settings.broadcastChannel,
          selectedUsernameToken: settings.selectedUsernameToken,
        });
        try {
          await connect(
            settings.broadcastChannel,
            user.id,
            settings.selectedUsernameToken
          );
          console.log("[ChatWidget] Connected to chat successfully");
        } catch (error) {
          console.error("[ChatWidget] Error connecting to chat:", error);
          toast.error({
            title: "Failed to connect to chat",
          });
        }
      }
    };
    console.log("[ChatWidget] Setting up chat");
    setupChat();

    return () => {
      if (isConnected) {
        console.log("[ChatWidget] Disconnecting from chat");
        disconnect();
      }
    };
  }, [
    isUserLoaded,
    isSignedIn,
    user?.id,
    settings.broadcastChannel,
    settings.selectedUsernameToken,
    connect,
    disconnect,
    isConnected,
  ]);

  const borderStyle = {
    borderColor: settings.borderColor,
    borderTopWidth: `${settings.borderTopWidth}px`,
    borderRightWidth: `${settings.borderRightWidth}px`,
    borderBottomWidth: `${settings.borderBottomWidth}px`,
    borderLeftWidth: `${settings.borderLeftWidth}px`,
    borderStyle: settings.borderStyle,
    borderRadius: `${settings.borderRadius}px`,
  };

  const ChatPreview = (
    <>
      <div className="h-full w-full flex items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-400">Chat Preview</h2>
      </div>
      <div>
        <div
          ref={chatContainerRef}
          className="w-full scrollbar-hide"
          style={{
            backgroundColor: settings.backgroundColor,
            color: settings.textColor,
            fontFamily: settings.fontFamily,
            fontSize: `${settings.fontSize}px`,
            opacity: settings.opacity / 100,
            overflowY: "auto",
          }}
        >
          {renderChatSkin()}
        </div>
      </div>
    </>
  );

  const ChatSettings = (
    <ChatSettingsForm settings={settings} onSettingsChange={setSettings} />
  );

  return <WidgetLayout preview={ChatPreview} settings={ChatSettings} />;
}
