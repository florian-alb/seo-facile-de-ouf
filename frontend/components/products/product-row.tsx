"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Eye, AlertTriangle } from "lucide-react";
import type { ShopifyProduct } from "@seo-facile-de-ouf/shared/src/shopify";

interface ProductRowProps {
  product: ShopifyProduct;
  storeId: string;
}

export function ProductRow({ product }: ProductRowProps) {
  const statusConfig = {
    ACTIVE: { label: "Actif", variant: "default" as const, color: "bg-green-500" },
    DRAFT: { label: "Brouillon", variant: "secondary" as const, color: "bg-yellow-500" },
    ARCHIVED: { label: "Archivé", variant: "outline" as const, color: "bg-gray-500" },
  };

  const status =
    statusConfig[product.status as keyof typeof statusConfig] ||
    statusConfig.ACTIVE;
  const isLowInventory = product.totalInventory < 10;
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <TableRow>
      {/* Image - 64x64 rounded Avatar */}
      <TableCell>
        <Avatar className="h-16 w-16 rounded-md">
          <AvatarImage
            src={product.imageUrl || undefined}
            alt={product.imageAlt || product.title}
          />
          <AvatarFallback className="rounded-md">
            {product.title.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </TableCell>

      {/* Product Info - Title + Handle */}
      <TableCell>
        <div className="space-y-1">
          <p className="font-medium">{product.title}</p>
          <p className="text-sm text-muted-foreground">{product.handle}</p>
        </div>
      </TableCell>

      {/* Price */}
      <TableCell>
        <div className="space-y-1">
          <p className="font-medium">{product.price.toFixed(2)} €</p>
          {hasDiscount && product.compareAtPrice && (
            <p className="text-sm text-muted-foreground line-through">
              {product.compareAtPrice.toFixed(2)} €
            </p>
          )}
        </div>
      </TableCell>

      {/* Inventory */}
      <TableCell>
        <div className="flex items-center gap-2">
          <span>{product.totalInventory}</span>
          {isLowInventory && (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          )}
        </div>
      </TableCell>

      {/* Status Badge */}
      <TableCell>
        <Badge variant={status.variant} className="gap-1.5">
          <div className={`h-2 w-2 rounded-full ${status.color}`} />
          {status.label}
        </Badge>
      </TableCell>

      {/* Actions - Shadcn default styles only */}
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          {/* Generate button - variant outline (Shadcn default) */}
          <Button variant="outline" size="sm">
            <Sparkles className="h-4 w-4 mr-1" />
            Générer
          </Button>

          {/* Eye icon - variant ghost (Shadcn default) */}
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
