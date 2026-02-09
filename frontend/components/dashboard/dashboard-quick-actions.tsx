import Link from "next/link";
import { Package, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ShopifyStore } from "@/types/shopify";

interface QuickActionsProps {
  stores: ShopifyStore[];
}

export function DashboardQuickActions({ stores }: QuickActionsProps) {
  const firstConnectedStore = stores.find((s) => s.status === "connected");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions rapides</CardTitle>
        <CardDescription>Accès direct aux fonctionnalités clés</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {firstConnectedStore && (
            <>
              <Button variant="outline" asChild>
                <Link
                  href={`/dashboard/store/${firstConnectedStore.id}/products`}
                >
                  <Package className="size-4" />
                  Voir les produits
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link
                  href={`/dashboard/store/${firstConnectedStore.id}/settings`}
                >
                  <Settings className="size-4" />
                  Paramètres SEO
                </Link>
              </Button>
            </>
          )}
          {stores.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Ajoutez une boutique depuis la sidebar pour commencer.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
