"use client";

import Image from "next/image";
import type { ShopifyProduct } from "@seo-facile-de-ouf/shared/src/shopify-products";
import type { ShopifyCollection } from "@seo-facile-de-ouf/shared/src/shopify-collections";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductInfoSidebarProps {
  product: ShopifyProduct;
  collections: ShopifyCollection[];
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function ProductInfoSidebar({
  product,
  collections,
}: ProductInfoSidebarProps) {
  // Map collectionIds to collection objects
  const productCollections = collections.filter((collection) =>
    product.collectionIds.includes(collection.shopifyGid)
  );

  return (
    <div className="space-y-4">
      {/* Product Image */}
      {product.imageUrl && (
        <Card size="sm">
          <CardHeader>
            <CardTitle>Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={product.imageUrl}
                alt={product.imageAlt || product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 300px"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Information */}
      <Card size="sm">
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            {/* Price */}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Prix</dt>
              <dd className="font-medium">
                {product.compareAtPrice && product.compareAtPrice > product.price ? (
                  <span className="flex items-center gap-2">
                    <span className="text-muted-foreground line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                    <span>{formatPrice(product.price)}</span>
                  </span>
                ) : (
                  formatPrice(product.price)
                )}
              </dd>
            </div>

            {/* Vendor */}
            {product.vendor && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Vendeur</dt>
                <dd>{product.vendor}</dd>
              </div>
            )}

            {/* Product Type */}
            {product.productType && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Type</dt>
                <dd>{product.productType}</dd>
              </div>
            )}

            {/* SKU */}
            {product.sku && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">SKU</dt>
                <dd className="font-mono text-xs">{product.sku}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Collections */}
      {productCollections.length > 0 && (
        <Card size="sm">
          <CardHeader>
            <CardTitle>Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {productCollections.map((collection) => (
                <Badge key={collection.id} variant="outline">
                  {collection.title}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dates */}
      <Card size="sm">
        <CardHeader>
          <CardTitle>Historique</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Créé sur Shopify</dt>
              <dd className="text-xs">{formatDate(product.shopifyCreatedAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Mis à jour</dt>
              <dd className="text-xs">{formatDate(product.shopifyUpdatedAt)}</dd>
            </div>
            {product.publishedAt && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Publié</dt>
                <dd className="text-xs">{formatDate(product.publishedAt)}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
