"use client";

import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import DashboardHeader from "./dashboard-header";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { UserPublic } from "@seo-facile-de-ouf/shared/src/user";

export default function DashboardShell({
  children,
  user,
}: {
  children: ReactNode;
  user: UserPublic;
}) {
  const router = useRouter();

  const onLogout = async () => {
    await authClient.signOut();
    router.push("/auth/login");
    router.refresh();
  };
  return (
    <SidebarProvider>
      <AppSidebar onLogout={onLogout} user={user} />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
