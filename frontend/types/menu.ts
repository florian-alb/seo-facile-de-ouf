import type { LucideIcon } from "lucide-react";

export type NavSubItem = {
  title: string;
  url: string;
};

export type NavMainItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items: NavSubItem[];
};

export type NavSecondaryItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export type Project = {
  name: string;
  url: string;
  icon: LucideIcon;
};

export type SidebarNavMenu = {
  navMain?: NavMainItem[];
  navSecondary?: NavSecondaryItem[];
  projects?: Project[];
};
