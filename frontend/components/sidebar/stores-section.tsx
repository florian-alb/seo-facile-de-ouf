"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { AddStoreDialog } from "@/components/sidebar/add-store-dialog";
import { EditStoreDialog } from "@/components/stores/edit-store-dialog";
import { StoresList } from "@/components/sidebar/stores-list";
import { useStores } from "@/hooks/use-shopify-stores";
import type { ShopifyStoreFormValues } from "@/types/shopify";

export function StoresSection() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { stores, isLoading, error, addStore, updateStore, deleteStore, getStore } = useStores();

  const handleAddStore = async (values: ShopifyStoreFormValues) => {
    try {
      setIsSubmitting(true);
      const oauthUrl = await addStore(values);
      // Redirect browser to Shopify OAuth consent screen
      window.location.href = oauthUrl;
    } catch {
      toast.error("Erreur lors de l'ajout de la boutique.");
      setIsSubmitting(false);
    }
  };

  const handleEditStore = (id: string) => {
    setEditingStoreId(id);
    setEditDialogOpen(true);
  };

  const handleUpdateStore = async (values: ShopifyStoreFormValues) => {
    if (!editingStoreId) return;

    try {
      setIsSubmitting(true);
      await updateStore(editingStoreId, values);
      setEditDialogOpen(false);
      setEditingStoreId(null);
      toast.success("Boutique mise à jour avec succès!");
    } catch {
      toast.error("Erreur lors de la mise à jour de la boutique.");
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

  const editingStore = editingStoreId ? getStore(editingStoreId) : null;

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Boutiques
      </SidebarGroupLabel>
      <SidebarGroupAction
        onClick={() => setDialogOpen(true)}
        className="hover:bg-sidebar-accent rounded-md"
        title="Ajouter une boutique"
      >
        <Plus className="size-4" />
        <span className="sr-only">Ajouter une boutique</span>
      </SidebarGroupAction>

      <SidebarGroupContent>
        {error && <p className="text-xs text-destructive px-2 py-1">{error}</p>}

        <StoresList
          stores={stores}
          isLoading={isLoading}
          onDelete={handleDeleteStore}
          onEdit={handleEditStore}
        />
      </SidebarGroupContent>

      <AddStoreDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleAddStore}
        isSubmitting={isSubmitting}
      />

      {editingStore && (
        <EditStoreDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSubmit={handleUpdateStore}
          defaultValues={{
            name: editingStore.name,
            url: editingStore.url,
            shopifyDomain: editingStore.shopifyDomain,
            language: editingStore.language,
          }}
          isSubmitting={isSubmitting}
        />
      )}
    </SidebarGroup>
  );
}
