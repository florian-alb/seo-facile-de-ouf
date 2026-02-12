"use client";

import type { UserPublic } from "@seo-facile-de-ouf/shared/src/user";
import { useTheme } from "next-themes";

import { Moon, Sun } from "lucide-react";

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
import { SeoEasyLogo } from "@/components/icons/logo-easy-seo";

export function AppSidebar({
  user,
  onLogout,
}: {
  user: UserPublic;
  onLogout: () => Promise<void>;
}) {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <SeoEasyLogo className="size-8! rounded-lg aspect-square" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    EasySEO
                  </span>
                  <span className="truncate text-xs">Le EasySEO</span>
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
            >
              <Sun className="size-4 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute size-4 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
              <span>Changer le thème</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser user={user} handlLogout={onLogout} />
      </SidebarFooter>
    </Sidebar>
  );
}
