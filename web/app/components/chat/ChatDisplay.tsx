import React from "react";
import type { ChatSettings } from "@/types/chat";

interface ChatDisplayProps {
  settings: ChatSettings;
}

export function ChatDisplay({ settings }: ChatDisplayProps) {
  const mockMessages = [
    {
      username: "ExampleUser",
      message: "Hello, this is a sample chat message!",
      timestamp: new Date().toLocaleTimeString(),
      badges: ["moderator", "subscriber"],
    },
    {
      username: "AnotherUser",
      message: "This is what chat messages will look like",
      timestamp: new Date().toLocaleTimeString(),
      badges: ["subscriber"],
    },
  ];

  return (
    <div
      className="h-full w-full flex flex-col"
      style={{
        backgroundColor: settings.backgroundColor,
        padding: settings.padding,
        opacity: settings.opacity / 100,
        border: settings.showBorders
          ? `${settings.borderWidth}px solid ${settings.borderColor}`
          : "none",
        borderRadius: settings.borderRadius,
      }}
    >
      <div className="flex-1 overflow-y-auto space-y-2">
        {mockMessages.map((msg, index) => (
          <div
            key={index}
            className={cn(
              "p-2 rounded",
              settings.chatLayout === "bubble" && "bg-white/10"
            )}
            style={{
              color: settings.textColor,
              fontSize: settings.fontSize,
              fontFamily: settings.fontFamily,
            }}
          >
            {settings.showUsernames && (
              <span className="font-bold mr-2">{msg.username}</span>
            )}
            {settings.showBadges && msg.badges.length > 0 && (
              <span className="space-x-1 mr-2">
                {msg.badges.map((badge) => (
                  <span
                    key={badge}
                    className="px-1 py-0.5 text-xs rounded bg-violet-500/20"
                  >
                    {badge}
                  </span>
                ))}
              </span>
            )}
            {settings.showTimestamps && (
              <span className="text-xs opacity-50 mr-2">{msg.timestamp}</span>
            )}
            <span>{msg.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
