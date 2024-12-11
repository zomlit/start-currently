import React from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useUser } from "@clerk/tanstack-start";
import { useChatStore } from "@/store/chatStore";
import { ChatSettingsForm } from "@/components/widget-settings/ChatSettingsForm";
import { PublicUrlHeader } from "@/components/widget-settings/PublicUrlHeader";
import { ChatDisplay } from "@/components/chat/ChatDisplay";
import type { ChatSettings } from "@/types/chat";

export const Route = createFileRoute("/_app/widgets/chat")({
  component: ChatPage,
  beforeLoad: ({ context, location }) => {
    return {
      layout: {
        preview: <ChatPreviewSection />,
        settings: <ChatSettingsSection />,
      },
    };
  },
});

function ChatPage() {
  return <Outlet />;
}

function ChatPreviewSection() {
  const { settings } = useChatStore();

  return (
    <div className="h-full w-full">
      <ChatDisplay settings={settings} />
    </div>
  );
}

function ChatSettingsSection() {
  const { user } = useUser();
  const { settings, updateSettings } = useChatStore();
  const publicUrl = user?.username
    ? `${window.location.origin}/${user.username}/chat`
    : "";

  const handleSettingsChange = async (newSettings: Partial<ChatSettings>) => {
    if (!user?.id) return;
    await updateSettings(newSettings, user.id);
  };

  const handlePreviewUpdate = (newSettings: Partial<ChatSettings>) => {
    useChatStore.setState((state) => ({
      settings: {
        ...state.settings,
        ...newSettings,
      },
    }));
  };

  return (
    <div className="flex flex-col">
      <PublicUrlHeader publicUrl={publicUrl} />
      <div className="flex-1">
        <ChatSettingsForm
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onPreviewUpdate={handlePreviewUpdate}
        />
      </div>
    </div>
  );
}
