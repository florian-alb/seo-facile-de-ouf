"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useImperativeHandle, forwardRef, useCallback } from "react";
import type { ShopifyCollection } from "@seo-facile-de-ouf/shared/src/shopify-collections";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { useFieldGeneration } from "@/hooks/use-generation";

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
  generateAll: () => void;
}

interface CollectionFormProps {
  collection: ShopifyCollection;
  storeId: string;
  onSave: (data: CollectionFormSchema) => Promise<void>;
  onPublish: (data: CollectionFormSchema) => Promise<void>;
  onDirtyChange?: (isDirty: boolean) => void;
  isSaving: boolean;
  isPublishing: boolean;
}

export const CollectionForm = forwardRef<CollectionFormRef, CollectionFormProps>(
  function CollectionForm(
    { collection, storeId, onSave, onPublish, onDirtyChange, isSaving, isPublishing },
    ref
  ) {
    const {
      register,
      handleSubmit,
      control,
      formState: { errors, isDirty },
      reset,
      getValues,
      setValue,
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

    // Store settings for AI generation
    const { settings, fetchSettings } = useStoreSettings(storeId);
    const { generations, startGeneration, isGenerating } = useFieldGeneration();

    useEffect(() => {
      fetchSettings();
    }, [fetchSettings]);

    // Inject generated description into form when completed
    useEffect(() => {
      const gen = generations.description;
      if (gen.status === "completed" && gen.result) {
        setValue("descriptionHtml", gen.result, { shouldDirty: true });
        toast.success("Description de la collection générée avec succès");
      }
      if (gen.status === "failed" && gen.error) {
        toast.error("Échec de la génération", { description: gen.error });
      }
    }, [generations.description.status, generations.description.result, generations.description.error, setValue]);

    // Inject generated SEO title
    useEffect(() => {
      const gen = generations.seoTitle;
      if (gen.status === "completed" && gen.result) {
        setValue("seoTitle", gen.result, { shouldDirty: true });
        toast.success("Titre SEO généré avec succès");
      }
      if (gen.status === "failed" && gen.error) {
        toast.error("Échec de la génération du titre SEO", { description: gen.error });
      }
    }, [generations.seoTitle.status, generations.seoTitle.result, generations.seoTitle.error, setValue]);

    // Inject generated SEO description
    useEffect(() => {
      const gen = generations.seoDescription;
      if (gen.status === "completed" && gen.result) {
        setValue("seoDescription", gen.result, { shouldDirty: true });
        toast.success("Description SEO générée avec succès");
      }
      if (gen.status === "failed" && gen.error) {
        toast.error("Échec de la génération de la description SEO", { description: gen.error });
      }
    }, [generations.seoDescription.status, generations.seoDescription.result, generations.seoDescription.error, setValue]);

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

    const buildStoreSettings = useCallback(() => {
      if (!settings) return null;
      return {
        nicheKeyword: settings.nicheKeyword,
        nicheDescription: settings.nicheDescription,
        language: settings.language,
        productWordCount: settings.productWordCount,
        collectionWordCount: settings.collectionWordCount,
        customerPersona: settings.customerPersona,
      };
    }, [settings]);

    const buildCollectionContext = useCallback(() => ({
      title: collection.title,
      handle: collection.handle,
      productsCount: collection.productsCount,
      currentDescription: getValues("descriptionHtml") || null,
    }), [collection, getValues]);

    const handleGenerateDescription = useCallback(() => {
      if (!settings) {
        toast.warning("Paramètres du magasin non configurés", {
          description: "Configurez vos paramètres SEO dans les réglages pour de meilleurs résultats.",
        });
      }
      startGeneration({
        entityType: "collection",
        collectionId: collection.id,
        collectionName: collection.title,
        shopId: storeId,
        fieldType: "description",
        keywords: [],
        storeSettings: buildStoreSettings(),
        collectionContext: buildCollectionContext(),
      });
    }, [collection, storeId, settings, startGeneration, buildStoreSettings, buildCollectionContext]);

    const handleGenerateSeoTitle = useCallback(() => {
      startGeneration({
        entityType: "collection",
        collectionId: collection.id,
        collectionName: collection.title,
        shopId: storeId,
        fieldType: "seoTitle",
        keywords: [],
        storeSettings: buildStoreSettings(),
        collectionContext: buildCollectionContext(),
      });
    }, [collection, storeId, startGeneration, buildStoreSettings, buildCollectionContext]);

    const handleGenerateSeoDescription = useCallback(() => {
      startGeneration({
        entityType: "collection",
        collectionId: collection.id,
        collectionName: collection.title,
        shopId: storeId,
        fieldType: "seoDescription",
        keywords: [],
        storeSettings: buildStoreSettings(),
        collectionContext: buildCollectionContext(),
      });
    }, [collection, storeId, startGeneration, buildStoreSettings, buildCollectionContext]);

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
      generateAll: () => {
        handleGenerateDescription();
        handleGenerateSeoTitle();
        handleGenerateSeoDescription();
      },
    }));

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
          isGenerating={isGenerating("description")}
          showCounter={false}
          onGenerate={handleGenerateDescription}
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
          isGenerating={isGenerating("seoTitle")}
          onGenerate={handleGenerateSeoTitle}
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
          isGenerating={isGenerating("seoDescription")}
          onGenerate={handleGenerateSeoDescription}
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
