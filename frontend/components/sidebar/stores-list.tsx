"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Store,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  ExternalLink,
  Package,
  Layers,
  Pencil,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { ShopifyStore } from "@/types/shopify";

type StoresListProps = {
  stores: ShopifyStore[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
};

export function StoresList({
  stores,
  isLoading,
  onDelete,
  onEdit,
}: StoresListProps) {
  const pathname = usePathname();

  if (isLoading) {
    return (
      <SidebarMenu>
        {Array.from({ length: 2 }).map((_, index) => (
          <SidebarMenuSkeleton key={index} showIcon />
        ))}
      </SidebarMenu>
    );
  }

  if (stores.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton disabled className="text-muted-foreground">
            <Store className="opacity-50" />
            <span className="text-sm">Aucune boutique</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      {stores.map((store) => {
        const collectionsUrl = `/dashboard/store/${store.id}/collections`;
        const productsUrl = `/dashboard/store/${store.id}/products`;
        const isStoreActive =
          pathname.startsWith(`/dashboard/store/${store.id}`);

        return (
          <Collapsible
            key={store.id}
            defaultOpen={isStoreActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={store.name}>
                  <Package className="size-4" />
                  <span className="flex-1 truncate">{store.name}</span>
                  <ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>

              <DropdownMenu>
                <DropdownMenuTrigger asChild >
                  <button
                    className="absolute right-[24px] top-1.5 flex h-5 w-5 items-center justify-center rounded-md hover:bg-sidebar-accent"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Actions</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-48">
                  <DropdownMenuItem
                    onClick={() => window.open(store.url, "_blank")}
                  >
                    <ExternalLink className="size-4" />
                    <span>Voir la boutique</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(store.id)}>
                    <Pencil className="size-4" />
                    <span>Modifier</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(store.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    <span>Supprimer</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      asChild
                      isActive={pathname === collectionsUrl}
                    >
                      <Link href={collectionsUrl}>
                        <Layers className="size-4" />
                        <span>Collections</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      asChild
                      isActive={pathname === productsUrl}
                    >
                      <Link href={productsUrl}>
                        <Package className="size-4" />
                        <span>Produits</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        );
      })}
    </SidebarMenu>
  );
}
