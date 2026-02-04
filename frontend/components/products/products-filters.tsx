"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useShopifyCollections } from "@/hooks/use-shopify-collections";
import type { ProductFilters } from "@seo-facile-de-ouf/shared/src/shopify-products";

interface ProductsFiltersProps {
  storeId: string;
  filters: ProductFilters;
  onFilterChange: (filters: Partial<ProductFilters>) => void;
  onClearFilters: () => void;
  onSearch: (search: string) => void;
}

export function ProductsFilters({
  storeId,
  filters,
  onFilterChange,
  onClearFilters,
  onSearch,
}: ProductsFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const { collections } = useShopifyCollections(storeId);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onSearch(searchValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, filters.search, onSearch]);

  const hasActiveFilters = filters.collectionId || filters.search || filters.status;

  return (
    <div className="flex flex-wrap gap-3">
      {/* Search Bar */}
      <div className="relative flex-1 min-w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, SKU, description..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => setSearchValue("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Collection Filter */}
      <Select
        value={filters.collectionId || "all"}
        onValueChange={(value) =>
          onFilterChange({ collectionId: value === "all" ? undefined : value })
        }
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Toutes les collections" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les collections</SelectItem>
          {collections.map((collection) => (
            <SelectItem key={collection.id} value={collection.shopifyGid}>
              {collection.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={filters.status || "all"}
        onValueChange={(value) =>
          onFilterChange({ status: value === "all" ? undefined : (value as ProductFilters["status"]) })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          <SelectItem value="ACTIVE">Actif</SelectItem>
          <SelectItem value="DRAFT">Brouillon</SelectItem>
          <SelectItem value="ARCHIVED">Archivé</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          onClick={() => {
            setSearchValue("");
            onClearFilters();
          }}
        >
          Réinitialiser
        </Button>
      )}
    </div>
  );
}
