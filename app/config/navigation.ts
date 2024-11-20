import {
  Eye,
  MessageCircle,
  Bell,
  BarChart2,
  LayoutDashboard,
  Users,
  Gamepad,
  Grid2x2,
  CircleDot,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import MicrophoneIcon from "@icons/outline/microphone-2.svg?react";

export type NavSubItem = {
  id: string;
  link: string;
  text: string;
  icon: LucideIcon | React.FC;
};

export type NavItem = {
  id: string;
  text: string;
  link?: string;
  icon: LucideIcon | React.FC;
  submenu?: readonly NavSubItem[];
};

export const navItems: readonly NavItem[] = [
  {
    id: "dashboard",
    text: "Dashboard",
    link: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "widgets",
    text: "Widgets",
    icon: Grid2x2,
    submenu: [
      {
        id: "visualizer",
        link: "/widgets/visualizer",
        text: "Visualizer",
        icon: Eye,
      },
      {
        id: "lyrics",
        link: "/widgets/lyrics",
        text: "Lyrics",
        icon: MicrophoneIcon,
      },
      {
        id: "chat",
        link: "/widgets/chat",
        text: "Chat",
        icon: MessageCircle,
      },
      {
        id: "alerts",
        link: "/widgets/alerts",
        text: "Alerts",
        icon: Bell,
      },
      {
        id: "stats",
        link: "/widgets/stats",
        text: "Stats",
        icon: BarChart2,
      },
      {
        id: "gamepad",
        link: "/widgets/gamepad",
        text: "Gamepad",
        icon: Gamepad,
      },
    ],
  },
  {
    id: "wheelspin",
    text: "Wheelspin",
    link: "/wheelspin",
    icon: CircleDot,
  },
  {
    id: "teampicker",
    link: "/teampicker",
    text: "Team Picker",
    icon: Users,
  },
] as const;
