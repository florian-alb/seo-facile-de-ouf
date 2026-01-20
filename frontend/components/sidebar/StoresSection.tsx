"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
} from "@/components/ui/sidebar";
import { AddStoreDialog } from "./AddStoreDialog";
import { StoresList } from "./StoresList";
import { useStores } from "@/hooks/useStores";
import type { ShopifyStoreFormValues } from "@/types/shopify";

export function StoresSection() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { stores, isLoading, addStore, deleteStore } = useStores();

  const handleAddStore = (values: ShopifyStoreFormValues) => {
    try {
      addStore(values);
      setDialogOpen(false);
      toast.success("Boutique ajoutée avec succès!");
    } catch {
      toast.error("Erreur lors de l'ajout de la boutique.");
    }
  };

  const handleDeleteStore = (id: string) => {
    const success = deleteStore(id);
    if (success) {
      toast.success("Boutique supprimée.");
    } else {
      toast.error("Erreur lors de la suppression.");
    }
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>MES BOUTIQUES</SidebarGroupLabel>
      <SidebarGroupAction asChild>
        <button
          onClick={() => setDialogOpen(true)}
          className="text-blue-500 hover:text-blue-600"
          aria-label="Ajouter une boutique"
        >
          <Plus />
        </button>
      </SidebarGroupAction>

      <StoresList
        stores={stores}
        isLoading={isLoading}
        onDelete={handleDeleteStore}
      />

      <AddStoreDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleAddStore}
      />
    </SidebarGroup>
  );
}
