"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import type { ShopifyCollection } from "@seo-facile-de-ouf/shared/src/shopify-collections";

import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldError,
} from "@/components/ui/field";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { GeneratableField } from "@/components/shared/generatable-field";
import { toast } from "sonner";

import {
  collectionFormSchema,
  type CollectionFormSchema,
} from "@/lib/validations/collection";

export interface CollectionFormRef {
  submit: (mode: "save" | "publish") => void;
  reset: () => void;
  getValues: () => CollectionFormSchema;
}

interface CollectionFormProps {
  collection: ShopifyCollection;
  onSave: (data: CollectionFormSchema) => Promise<void>;
  onPublish: (data: CollectionFormSchema) => Promise<void>;
  onDirtyChange?: (isDirty: boolean) => void;
  isSaving: boolean;
  isPublishing: boolean;
}

export const CollectionForm = forwardRef<CollectionFormRef, CollectionFormProps>(
  function CollectionForm(
    { collection, onSave, onPublish, onDirtyChange, isSaving, isPublishing },
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
    } = useForm<CollectionFormSchema>({
      resolver: zodResolver(collectionFormSchema),
      mode: "onBlur",
      defaultValues: {
        title: collection.title,
        descriptionHtml: collection.descriptionHtml || "",
        seoTitle: collection.seoTitle || "",
        seoDescription: collection.seoDescription || "",
      },
    });

    // Notify parent of dirty state changes
    useEffect(() => {
      onDirtyChange?.(isDirty);
    }, [isDirty, onDirtyChange]);

    // Reset form when collection changes
    useEffect(() => {
      reset({
        title: collection.title,
        descriptionHtml: collection.descriptionHtml || "",
        seoTitle: collection.seoTitle || "",
        seoDescription: collection.seoDescription || "",
      });
    }, [collection, reset]);

    const handleSave = async (data: CollectionFormSchema) => {
      try {
        await onSave(data);
        reset(data);
      } catch {
        // Error handled by parent
      }
    };

    const handlePublish = async (data: CollectionFormSchema) => {
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
          title: collection.title,
            descriptionHtml: collection.descriptionHtml || "",
          seoTitle: collection.seoTitle || "",
          seoDescription: collection.seoDescription || "",
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
            <CardTitle>Titre de la collection</CardTitle>
          </CardHeader>
          <CardContent>
            <Field>
              <Input
                id="title"
                placeholder="Nom de la collection"
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
                placeholder="Décrivez votre collection..."
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
      </div>
    );
  }
);
