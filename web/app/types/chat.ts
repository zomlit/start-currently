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
