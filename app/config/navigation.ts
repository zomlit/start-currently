import { LayoutDashboard, Users, Grid2x2, CircleDot } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { widgetSubmenuItems } from "./widgets";
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

export const navItems = [
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
    submenu: widgetSubmenuItems,
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
