export interface ChatSettings {
  broadcastChannel: string;
  selectedUsername: string;
  selectedUsernameToken?: string;
  showAvatars: boolean;
  showBadges: boolean;
  showPlatform: boolean;
  chatSkin: "default" | "compact" | "bubble";
  chatBubbleColor: string;
  maxHeight: number;
}

export interface TwitchAccount {
  providerUserId: string;
  label: string;
  avatar?: string;
}
