"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { StoreForm } from "@/components/stores/store-form";
import type { ShopifyStoreFormValues } from "@/types/shopify";

type EditStoreDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ShopifyStoreFormValues) => void | Promise<void>;
  defaultValues?: Partial<ShopifyStoreFormValues>;
  isSubmitting?: boolean;
};

export function EditStoreDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isSubmitting = false,
}: EditStoreDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier la boutique</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations de votre boutique Shopify.
          </DialogDescription>
        </DialogHeader>

        <StoreForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          submitLabel="Mettre à jour"
        />
      </DialogContent>
    </Dialog>
  );
}
