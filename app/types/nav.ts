import { LucideIcon } from "lucide-react";

export interface SubNavItem {
  id: string;
  text: string;
  link: string;
  icon: LucideIcon;
}

export interface NavItem {
  id: string;
  text: string;
  link?: string;
  icon: LucideIcon;
  submenu?: SubNavItem[];
}
