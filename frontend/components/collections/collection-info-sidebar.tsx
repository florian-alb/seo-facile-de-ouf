"use client";

import Image from "next/image";
import type { ShopifyCollection } from "@seo-facile-de-ouf/shared/src/shopify-collections";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/format";

interface CollectionInfoSidebarProps {
  collection: ShopifyCollection;
}

export function CollectionInfoSidebar({
  collection,
}: CollectionInfoSidebarProps) {
  return (
    <div className="space-y-4">
      {/* Collection Image */}
      {collection.imageUrl && (
        <Card size="sm">
          <CardHeader>
            <CardTitle>Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={collection.imageUrl}
                alt={collection.imageAlt || collection.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 300px"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collection Information */}
      <Card size="sm">
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Nombre de produits</dt>
              <dd className="font-medium">{collection.productsCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Handle</dt>
              <dd className="font-mono text-xs">{collection.handle}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Dates */}
      <Card size="sm">
        <CardHeader>
          <CardTitle>Historique</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Mis à jour sur Shopify</dt>
              <dd className="text-xs">{formatDate(collection.shopifyUpdatedAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Synchronisé le</dt>
              <dd className="text-xs">{formatDate(collection.updatedAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
