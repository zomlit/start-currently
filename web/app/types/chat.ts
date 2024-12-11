export interface Badge {
  id: string;
  version: string;
  urls?: {
    "1x": string;
    "2x": string;
    "4x": string;
  };
}

export interface Message {
  id: string;
  username: string;
  message: string;
  timestamp: number;
  type: string;
  avatar?: string;
  badges: {
    user: Badge[];
    global: Badge[];
    channel: Badge[];
  };
  color?: string;
  platform?: string;
  emotes?: Emote[];
}

export interface Emote {
  id: string;
  name: string;
  url: string;
  provider: "twitch" | "7tv" | "bttv";
  positions: [number, number][];
}

export interface ChatMessage {
  id: string;
  channel: string;
  username: string;
  message: string;
  color: string;
  badges: any;
  emotes: any;
  userStatus: any;
  avatar: string;
  timestamp: string;
}

export interface ChatSettings {
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  padding: number;
  showBorders: boolean;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  opacity: number;
  showUsernames: boolean;
  showTimestamps: boolean;
  showBadges: boolean;
  chatLayout: "default" | "compact" | "bubble";
}

export const defaultChatSettings: ChatSettings = {
  backgroundColor: "#000000",
  textColor: "#ffffff",
  fontSize: 16,
  fontFamily: "Inter",
  padding: 16,
  showBorders: true,
  borderColor: "#ffffff",
  borderWidth: 1,
  borderRadius: 8,
  opacity: 100,
  showUsernames: true,
  showTimestamps: true,
  showBadges: true,
  chatLayout: "default",
};
