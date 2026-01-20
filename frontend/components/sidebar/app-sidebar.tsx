"use client";

import type { UserPublic } from "@seo-facile-de-ouf/shared/src/user";

import { Command } from "lucide-react";

import { NavUser } from "@/components/sidebar/nav-user";
import { StoresSection } from "@/components/sidebar/stores-section";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({
  user,
  onLogout,
}: {
  user: UserPublic;
  onLogout: () => Promise<void>;
}) {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    Seo Facile De Ouf
                  </span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <StoresSection />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} handlLogout={onLogout} />
      </SidebarFooter>
    </Sidebar>
  );
}
