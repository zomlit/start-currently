import {
  Eye,
  MessageCircle,
  Bell,
  BarChart2,
  LayoutDashboard,
  Users,
} from "lucide-react";
import MicrophoneIcon from "@icons/outline/microphone-2.svg?react";

export const navItems = [
  {
    id: 1,
    link: "/widgets/visualizer",
    text: "Visualizer",
    icon: Eye,
  },
  {
    id: 2,
    link: "/lyrics",
    text: "Lyrics",
    icon: MicrophoneIcon,
  },
  {
    id: 3,
    link: "/widgets/chat",
    text: "Chat",
    icon: MessageCircle,
  },
  {
    id: 4,
    link: "/widgets/alerts",
    text: "Alerts",
    icon: Bell,
  },
  {
    id: 5,
    link: "/widgets/stats",
    text: "Stats",
    icon: BarChart2,
  },
  {
    id: 6,
    link: "/dashboard",
    text: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: 7,
    link: "/teampicker",
    text: "Team Picker",
    icon: Users,
  },
] as const;

export type NavItem = (typeof navItems)[number];
