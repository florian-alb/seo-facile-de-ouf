import Link from "next/link";
import { Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import type { ShopifyStore } from "@/types/shopify";

interface StoresOverviewProps {
  stores: ShopifyStore[];
  className?: string;
}

const statusMap: Record<
  ShopifyStore["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  connected: { label: "Connectée", variant: "default" },
  pending: { label: "En attente", variant: "outline" },
  error: { label: "Erreur", variant: "destructive" },
};

export function DashboardStoresOverview({
  stores,
  className,
}: StoresOverviewProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Boutiques</CardTitle>
        <CardDescription>Vos boutiques Shopify</CardDescription>
      </CardHeader>
      <CardContent>
        {stores.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Store />
              </EmptyMedia>
              <EmptyTitle>Aucune boutique</EmptyTitle>
              <EmptyDescription>
                Ajoutez votre première boutique Shopify depuis la sidebar.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-3">
            {stores.map((store) => {
              const status = statusMap[store.status];
              return (
                <Link
                  key={store.id}
                  href={`/dashboard/store/${store.id}/products`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{store.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {store.shopifyDomain}
                    </p>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
