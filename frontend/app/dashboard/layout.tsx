import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "../../components/dashboard/dashboard-shell";
import { UserPublic, User } from "@seo-facile-de-ouf/shared/src/user";
import { Session } from "@seo-facile-de-ouf/shared/src/session";


async function getSessionFromAuthServer(): Promise<{ session?: Session, user?: User } | null> {
  const API_URL = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  const cookie = (await headers()).get("cookie") ?? "";

  const res = await fetch(`${API_URL}/api/auth/get-session`, {
    method: "GET",
    headers: { cookie },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return await res.json();
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSessionFromAuthServer();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const user: UserPublic = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? "",
  };

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
