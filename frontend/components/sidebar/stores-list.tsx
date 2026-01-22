"use client";

import {
  Store,
  MoreHorizontal,
  Trash2,
  ExternalLink,
  Package,
  Layers,
  Pencil,
} from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuSkeleton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { ShopifyStore } from "@/types/shopify";
import { NavMain } from "./nav-main";
import { NavMainItem } from "@/types/menu";

type StoresListProps = {
  stores: ShopifyStore[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
};

export function StoresList({ stores, isLoading, onDelete, onEdit }: StoresListProps) {
  const { isMobile } = useSidebar();

  const storeNavMain: NavMainItem[] = stores.map((store) => ({
    title: store.name,
    url: "#",
    icon: Package,
    items: [
      {
        title: "Collections",
        url: `/dashboard/store/${store.id}/collections`,
        icon: Layers,
      },
      {
        title: "Produits",
        url: "#",
        icon: Package,
      },
    ],
  }));

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
      {stores.map((store) => (
        <SidebarMenuItem key={store.id}>
          <NavMain items={storeNavMain} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction showOnHover>
                <MoreHorizontal />
                <span className="sr-only">Actions</span>
              </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-48"
              side={isMobile ? "bottom" : "right"}
              align={isMobile ? "end" : "start"}
            >
              <DropdownMenuItem
                onClick={() => window.open(store.url, "_blank")}
              >
                <ExternalLink />
                <span>Voir la boutique</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(store.id)}>
                <Pencil />
                <span>Modifier</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(store.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 />
                <span>Supprimer</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
