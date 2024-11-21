import {
  LayoutDashboard,
  BarChart3,
  Music2,
  MessageSquare,
  Bell,
  BarChart2,
  Gamepad2,
} from "lucide-react";

export const widgetNavItems = [
  {
    id: "overview",
    text: "Overview",
    link: "/widgets",
    icon: LayoutDashboard,
  },
  {
    id: "visualizer",
    text: "Visualizer",
    link: "/widgets/visualizer",
    icon: BarChart3,
  },
  {
    id: "lyrics",
    text: "Lyrics",
    link: "/widgets/lyrics",
    icon: Music2,
  },
  {
    id: "chat",
    text: "Chat",
    link: "/widgets/chat",
    icon: MessageSquare,
  },
  {
    id: "alerts",
    text: "Alerts",
    link: "/widgets/alerts",
    icon: Bell,
  },
  {
    id: "stats",
    text: "Stats",
    link: "/widgets/stats",
    icon: BarChart2,
  },
  {
    id: "gamepad",
    text: "Gamepad",
    link: "/widgets/gamepad",
    icon: Gamepad2,
  },
] as const;
