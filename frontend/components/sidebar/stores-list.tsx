"use client";

import { Store, MoreHorizontal, Trash2 } from "lucide-react";

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

type StoresListProps = {
  stores: ShopifyStore[];
  isLoading: boolean;
  onDelete: (id: string) => void;
};

export function StoresList({ stores, isLoading, onDelete }: StoresListProps) {
  const { isMobile } = useSidebar();

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
          <SidebarMenuButton asChild>
            <a href={store.url} target="_blank" rel="noopener noreferrer">
              <Store />
              <span>{store.name}</span>
            </a>
          </SidebarMenuButton>
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
