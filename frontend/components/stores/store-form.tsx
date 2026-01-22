"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";

import {
  shopifyStoreSchema,
  type ShopifyStoreFormSchema,
} from "@/lib/validations/store";
import {
  LANGUAGE_OPTIONS,
  type ShopifyStoreFormValues,
} from "@/types/shopify";

type StoreFormProps = {
  defaultValues?: Partial<ShopifyStoreFormValues>;
  onSubmit: (values: ShopifyStoreFormValues) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  showCancel?: boolean;
};

export function StoreForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting: externalSubmitting = false,
  submitLabel = "Enregistrer",
  showCancel = true,
}: StoreFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ShopifyStoreFormSchema>({
    resolver: zodResolver(shopifyStoreSchema),
    mode: "onBlur",
    defaultValues: {
      name: defaultValues?.name ?? "",
      url: defaultValues?.url ?? "",
      shopifyDomain: defaultValues?.shopifyDomain ?? "",
      language: defaultValues?.language ?? "fr",
      clientId: defaultValues?.clientId ?? "",
      clientSecret: defaultValues?.clientSecret ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="store-name">Nom de la boutique</FieldLabel>
          <Input
            id="store-name"
            placeholder="Ma Boutique"
            {...register("name")}
          />
          {errors.name?.message && (
            <FieldError>{errors.name.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="store-url">URL de la boutique</FieldLabel>
          <Input
            id="store-url"
            placeholder="https://www.maboutique.com"
            {...register("url")}
          />
          {errors.url?.message && <FieldError>{errors.url.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="shopify-domain">Domaine Shopify</FieldLabel>
          <Input
            id="shopify-domain"
            placeholder="boutique.myshopify.com"
            {...register("shopifyDomain")}
          />
          <FieldDescription>
            Format: votreboutique.myshopify.com
          </FieldDescription>
          {errors.shopifyDomain?.message && (
            <FieldError>{errors.shopifyDomain.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="language">Langue</FieldLabel>
          <Controller
            name="language"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="language" className="w-full">
                  <SelectValue placeholder="Sélectionnez une langue" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.language?.message && (
            <FieldError>{errors.language.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="client-id">Shopify Client ID</FieldLabel>
          <Input
            id="client-id"
            type="password"
            placeholder="Votre Client ID"
            {...register("clientId")}
          />
          {errors.clientId?.message && (
            <FieldError>{errors.clientId.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="client-secret">
            Shopify Client Secret / Access Token
          </FieldLabel>
          <Input
            id="client-secret"
            type="password"
            placeholder="shpss_..."
            {...register("clientSecret")}
          />
          <FieldDescription>
            Doit commencer par &quot;shpss_&quot;
          </FieldDescription>
          {errors.clientSecret?.message && (
            <FieldError>{errors.clientSecret.message}</FieldError>
          )}
        </Field>
      </FieldGroup>

      <div className="flex gap-3 mt-6">
        {showCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || externalSubmitting}
          >
            Annuler
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || externalSubmitting}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isSubmitting || externalSubmitting ? "Enregistrement..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
