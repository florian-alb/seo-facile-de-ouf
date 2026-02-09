"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { Skeleton } from "@/components/dashboard/skelton";
import { DashboardStatsCards } from "@/components/dashboard/dashboard-stats-cards";
import { DashboardRecentGenerations } from "@/components/dashboard/dashboard-recent-generations";
import { DashboardStoresOverview } from "@/components/dashboard/dashboard-stores-overview";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";

export default function Page() {
  const searchParams = useSearchParams();
  const stats = useDashboardStats();

  // Handle OAuth callback
  useEffect(() => {
    const authStatus = searchParams.get("shopify_auth");
    const storeName = searchParams.get("store_name");
    const errorMessage = searchParams.get("message");

    if (authStatus === "success" && storeName) {
      toast.success(
        `Boutique "${decodeURIComponent(storeName)}" connectée avec succès !`
      );
      window.history.replaceState({}, "", "/dashboard");
    } else if (authStatus === "error") {
      toast.error(
        `Erreur OAuth: ${errorMessage || "Échec de la connexion"}`
      );
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams]);

  if (stats.isLoading) return <Skeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de votre activité SEO
        </p>
      </div>

      {/* Stats Cards */}
      <DashboardStatsCards
        connectedStores={stats.connectedStores}
        totalProducts={stats.totalProducts}
        totalCollections={stats.totalCollections}
        completedGenerations={stats.completedGenerations}
      />

      {/* Main content: Generations + Stores */}
      <div className="grid gap-6 lg:grid-cols-3">
        <DashboardRecentGenerations
          generations={stats.recentGenerations}
          className="lg:col-span-2"
        />
        <DashboardStoresOverview stores={stats.stores} />
      </div>

      {/* Quick Actions */}
      <DashboardQuickActions stores={stats.stores} />
    </div>
  );
}
