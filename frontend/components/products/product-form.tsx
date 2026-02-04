"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import type { ShopifyProduct } from "@seo-facile-de-ouf/shared/src/shopify-products";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { GeneratableField } from "@/components/shared/generatable-field";
import { toast } from "sonner";

import {
  productFormSchema,
  type ProductFormSchema,
} from "@/lib/validations/product";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Actif" },
  { value: "DRAFT", label: "Brouillon" },
  { value: "ARCHIVED", label: "Archivé" },
] as const;

export interface ProductFormRef {
  submit: (mode: "save" | "publish") => void;
  reset: () => void;
  getValues: () => ProductFormSchema;
}

interface ProductFormProps {
  product: ShopifyProduct;
  onSave: (data: ProductFormSchema) => Promise<void>;
  onPublish: (data: ProductFormSchema) => Promise<void>;
  onDirtyChange?: (isDirty: boolean) => void;
  isSaving: boolean;
  isPublishing: boolean;
}

export const ProductForm = forwardRef<ProductFormRef, ProductFormProps>(
  function ProductForm(
    { product, onSave, onPublish, onDirtyChange, isSaving, isPublishing },
    ref
  ) {
    const {
      register,
      handleSubmit,
      control,
      formState: { errors, isDirty },
      reset,
      getValues,
      watch,
    } = useForm<ProductFormSchema>({
      resolver: zodResolver(productFormSchema),
      mode: "onBlur",
      defaultValues: {
        title: product.title,
        descriptionHtml: product.descriptionHtml || "",
        seoTitle: product.seoTitle || "",
        seoDescription: product.seoDescription || "",
        tags: product.tags,
        imageAlt: product.imageAlt || "",
        status: product.status,
      },
    });

    // Notify parent of dirty state changes
    useEffect(() => {
      onDirtyChange?.(isDirty);
    }, [isDirty, onDirtyChange]);

    // Reset form when product changes
    useEffect(() => {
      reset({
        title: product.title,
        descriptionHtml: product.descriptionHtml || "",
        seoTitle: product.seoTitle || "",
        seoDescription: product.seoDescription || "",
        tags: product.tags,
        imageAlt: product.imageAlt || "",
        status: product.status,
      });
    }, [product, reset]);

    const handleSave = async (data: ProductFormSchema) => {
      try {
        await onSave(data);
        reset(data);
      } catch {
        // Error handled by parent
      }
    };

    const handlePublish = async (data: ProductFormSchema) => {
      try {
        await onPublish(data);
        reset(data);
      } catch {
        // Error handled by parent
      }
    };

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      submit: (mode: "save" | "publish") => {
        if (mode === "save") {
          handleSubmit(handleSave)();
        } else {
          handleSubmit(handlePublish)();
        }
      },
      reset: () => {
        reset({
          title: product.title,
          descriptionHtml: product.descriptionHtml || "",
          seoTitle: product.seoTitle || "",
          seoDescription: product.seoDescription || "",
          tags: product.tags,
          imageAlt: product.imageAlt || "",
          status: product.status,
        });
        // Immediately notify parent that form is no longer dirty
        onDirtyChange?.(false);
      },
      getValues,
    }));

    const handleGenerateClick = () => {
      toast.info("Fonctionnalité à venir", {
        description:
          "La génération IA sera disponible dans une prochaine version.",
      });
    };

    const isDisabled = isSaving || isPublishing;

    return (
      <div className="space-y-4">
        {/* Title */}
        <Card size="sm">
          <CardHeader>
            <CardTitle>Titre du produit</CardTitle>
          </CardHeader>
          <CardContent>
            <Field>
              <Input
                id="title"
                placeholder="Nom du produit"
                disabled={isDisabled}
                {...register("title")}
              />
              {errors.title?.message && (
                <FieldError>{errors.title.message}</FieldError>
              )}
            </Field>
          </CardContent>
        </Card>

        {/* Description */}
        <GeneratableField
          title="Description"
          value={watch("descriptionHtml") || ""}
          error={errors.descriptionHtml?.message}
          disabled={isDisabled}
          showCounter={false}
          onGenerate={handleGenerateClick}
        >
          <Controller
            name="descriptionHtml"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value || ""}
                onChange={field.onChange}
                placeholder="Décrivez votre produit..."
                disabled={isDisabled}
              />
            )}
          />
        </GeneratableField>

        {/* SEO Title */}
        <GeneratableField
          title="Titre SEO"
          value={watch("seoTitle") || ""}
          error={errors.seoTitle?.message}
          disabled={isDisabled}
          onGenerate={handleGenerateClick}
        >
          <Textarea
            id="seoTitle"
            placeholder="Titre SEO"
            disabled={isDisabled}
            {...register("seoTitle")}
          />
        </GeneratableField>

        {/* SEO Description */}
        <GeneratableField
          title="Description SEO"
          value={watch("seoDescription") || ""}
          error={errors.seoDescription?.message}
          disabled={isDisabled}
          onGenerate={handleGenerateClick}
        >
          <Textarea
            id="seoDescription"
            placeholder="Description SEO"
            disabled={isDisabled}
            {...register("seoDescription")}
          />
        </GeneratableField>

        {/* Status */}
        <Card size="sm">
          <CardHeader>
            <CardTitle>Statut</CardTitle>
          </CardHeader>
          <CardContent>
            <Field>
              <FieldLabel htmlFor="status">Statut du produit</FieldLabel>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isDisabled}
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Sélectionnez un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status?.message && (
                <FieldError>{errors.status.message}</FieldError>
              )}
            </Field>
          </CardContent>
        </Card>
      </div>
    );
  }
);
