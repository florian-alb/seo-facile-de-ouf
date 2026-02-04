"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import {
  storeSettingsSchema,
  type StoreSettingsFormSchema,
} from "@/lib/validations/store-settings";
import { LANGUAGE_OPTIONS } from "@/types/shopify";
import type { StoreSettings } from "@seo-facile-de-ouf/shared/src/store-settings";

type SettingsFormProps = {
  defaultValues?: StoreSettings | null;
  onSubmit: (values: StoreSettingsFormSchema) => void | Promise<void>;
  isSaving?: boolean;
};

export function SettingsForm({
  defaultValues,
  onSubmit,
  isSaving = false,
}: SettingsFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StoreSettingsFormSchema>({
    resolver: zodResolver(storeSettingsSchema),
    mode: "onBlur",
    defaultValues: {
      nicheKeyword: defaultValues?.nicheKeyword ?? "",
      nicheDescription: defaultValues?.nicheDescription ?? "",
      language: defaultValues?.language ?? "fr",
      collectionWordCount: defaultValues?.collectionWordCount ?? 800,
      productWordCount: defaultValues?.productWordCount ?? 400,
      customerPersona: defaultValues?.customerPersona ?? "",
    },
  });

  const busy = isSubmitting || isSaving;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-6 md:grid-cols-2"
    >
      {/* Niche — full width */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Niche</CardTitle>
          <CardDescription>
            Mot clé principal et positionnement de votre boutique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="niche-keyword">
                Mot clé de la niche
              </FieldLabel>
              <Input
                id="niche-keyword"
                placeholder="ex: chaussures de running"
                {...register("nicheKeyword")}
              />
              <FieldDescription>
                Le mot clé principal qui définit votre boutique
              </FieldDescription>
              {errors.nicheKeyword?.message && (
                <FieldError>{errors.nicheKeyword.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="niche-description">
                Description de la niche
              </FieldLabel>
              <Textarea
                id="niche-description"
                placeholder="Décrivez votre niche en quelques phrases..."
                rows={3}
                {...register("nicheDescription")}
              />
              <FieldDescription>
                Votre marché et votre positionnement
              </FieldDescription>
              {errors.nicheDescription?.message && (
                <FieldError>{errors.nicheDescription.message}</FieldError>
              )}
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Langue — left cell */}
      <Card>
        <CardHeader>
          <CardTitle>Langue</CardTitle>
          <CardDescription>
            Langue de génération des textes SEO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel htmlFor="settings-language">
              Langue de la boutique
            </FieldLabel>
            <Controller
              name="language"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="settings-language" className="w-full">
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
        </CardContent>
      </Card>

      {/* Nombre de mots — right cell */}
      <Card>
        <CardHeader>
          <CardTitle>Nombre de mots</CardTitle>
          <CardDescription>
            Longueur cible des textes générés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 grid-cols-2">
            <Field>
              <FieldLabel htmlFor="collection-word-count">
                Collections
              </FieldLabel>
              <Input
                id="collection-word-count"
                type="number"
                min={600}
                max={1200}
                step={50}
                {...register("collectionWordCount", { valueAsNumber: true })}
              />
              <FieldDescription>600 – 1200 mots</FieldDescription>
              {errors.collectionWordCount?.message && (
                <FieldError>{errors.collectionWordCount.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="product-word-count">Produits</FieldLabel>
              <Input
                id="product-word-count"
                type="number"
                min={200}
                max={600}
                step={50}
                {...register("productWordCount", { valueAsNumber: true })}
              />
              <FieldDescription>200 – 600 mots</FieldDescription>
              {errors.productWordCount?.message && (
                <FieldError>{errors.productWordCount.message}</FieldError>
              )}
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Persona client — full width */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Persona client</CardTitle>
          <CardDescription>
            Décrivez votre client idéal pour adapter le ton des textes générés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel htmlFor="customer-persona">
              Description du persona
            </FieldLabel>
            <Textarea
              id="customer-persona"
              placeholder="ex: Femme active de 25-40 ans, passionnée de sport, sensible à la qualité et au design. Elle recherche des produits durables avec un bon rapport qualité-prix..."
              rows={5}
              {...register("customerPersona")}
            />
            {errors.customerPersona?.message && (
              <FieldError>{errors.customerPersona.message}</FieldError>
            )}
          </Field>
        </CardContent>
      </Card>

      {/* Submit — full width */}
      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={busy}>
          {busy ? "Enregistrement..." : "Enregistrer les paramètres"}
        </Button>
      </div>
    </form>
  );
}
