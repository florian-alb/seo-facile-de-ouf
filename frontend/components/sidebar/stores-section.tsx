"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
} from "@/components/ui/sidebar";
import { AddStoreDialog } from "@/components/sidebar/add-store-dialog";
import { StoresList } from "@/components/sidebar/stores-list";
import { useStores } from "@/hooks/use-shopify-stores";
import type { ShopifyStoreFormValues } from "@/types/shopify";

export function StoresSection() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { stores, isLoading, error, addStore, deleteStore } = useStores();

  const handleAddStore = async (values: ShopifyStoreFormValues) => {
    try {
      setIsSubmitting(true);
      await addStore(values);
      setDialogOpen(false);
      toast.success("Boutique ajoutée avec succès!");
    } catch {
      toast.error("Erreur lors de l'ajout de la boutique.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStore = async (id: string) => {
    const success = await deleteStore(id);
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

      {error && <p className="text-xs text-destructive px-2">{error}</p>}

      <StoresList
        stores={stores}
        isLoading={isLoading}
        onDelete={handleDeleteStore}
      />

      <AddStoreDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleAddStore}
        isSubmitting={isSubmitting}
      />
    </SidebarGroup>
  );
}
