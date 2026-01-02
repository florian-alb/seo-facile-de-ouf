import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "./components/dashboard-shell";

type Session = {
  user?: { id: string; name?: string | null; email?: string | null };
};

async function getSessionFromAuthServer(): Promise<Session | null> {
  const API_URL = process.env.API_URL ?? "http://localhost:4000";

  const cookie = (await headers()).get("cookie") ?? "";

  const res = await fetch(`${API_URL}/api/auth/get-session`, {
    method: "GET",
    headers: { cookie },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const json: unknown = await res.json();

  if (typeof json === "object" && json !== null) {
    const maybeData = (json as Record<string, unknown>).data;
    if (typeof maybeData === "object" && maybeData !== null)
      return maybeData as Session;
    return json as Session;
  }

  return null;
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSessionFromAuthServer();

  console.log("session", session);

  if (!session?.user) {
    redirect("/auth/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
