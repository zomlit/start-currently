import {
  BarChart3,
  MessageSquare,
  Music2,
  Bell,
  Gamepad2,
  LayoutDashboard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface WidgetConfig {
  id: string;
  title: string;
  text: string; // Used in navigation
  description: string;
  icon: LucideIcon;
  href: string;
}

export const widgetConfigs = [
  {
    id: "overview",
    title: "Widget Gallery",
    text: "Overview",
    description: "Browse and manage your stream widgets",
    icon: LayoutDashboard,
    href: "/widgets",
  },
  {
    id: "visualizer",
    title: "Visualizer",
    text: "Visualizer",
    description: "Create dynamic visual effects for your stream",
    icon: BarChart3,
    href: "/widgets/visualizer",
  },
  {
    id: "lyrics",
    title: "Lyrics",
    text: "Lyrics",
    description: "Display synchronized lyrics during music playback",
    icon: Music2,
    href: "/widgets/lyrics",
  },
  {
    id: "gamepad",
    title: "Gamepad",
    text: "Gamepad",
    description: "Show controller inputs and game interactions",
    icon: Gamepad2,
    href: "/widgets/gamepad",
  },
  {
    id: "chat",
    title: "Chat",
    text: "Chat",
    description: "Customize your stream chat experience",
    icon: MessageSquare,
    href: "/widgets/chat",
  },
  {
    id: "alerts",
    title: "Alerts",
    text: "Alerts",
    description: "Set up and customize stream alerts",
    icon: Bell,
    href: "/widgets/alerts",
  },
  {
    id: "stats",
    title: "Stats",
    text: "Stats",
    description: "Display real-time statistics and metrics",
    icon: BarChart3,
    href: "/widgets/stats",
  },
] as const;

export const getWidgetConfig = (id: string) => {
  return widgetConfigs.find((config) => config.id === id);
};

export const getSectionContent = (routeId: string) => {
  const widgetId = routeId.split("/").pop();
  const widget = widgetId ? getWidgetConfig(widgetId) : null;

  return {
    category: "Widgets",
    title: widget?.title ?? "Widget Gallery",
    description: widget?.description ?? "Browse and manage your stream widgets",
  };
};

// Navigation-specific exports
export const widgetNavItems = widgetConfigs.map(({ id, text, href, icon }) => ({
  id,
  text,
  link: href,
  icon,
}));

// For the main navigation submenu
export const widgetSubmenuItems = widgetConfigs
  .filter((widget) => widget.id !== "overview")
  .map(({ id, text, href, icon }) => ({
    id,
    text,
    link: href,
    icon,
  }));
