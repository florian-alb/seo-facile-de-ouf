"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { useStoreSettings } from "@/hooks/use-store-settings";
import { SettingsForm } from "@/components/settings/settings-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { StoreSettingsFormSchema } from "@/lib/validations/store-settings";

export default function SettingsPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const { settings, isLoading, isSaving, error, fetchSettings, saveSettings } =
    useStoreSettings(storeId);

  useEffect(() => {
    fetchSettings();
  }, [storeId]);

  const handleSubmit = async (data: StoreSettingsFormSchema) => {
    try {
      await saveSettings(data);
      toast.success("Paramètres enregistrés");
    } catch {
      toast.error("Erreur lors de l'enregistrement des paramètres");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-80" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="md:col-span-2 h-52" />
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
          <Skeleton className="md:col-span-2 h-40" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Paramètres SEO</h1>
          <p className="text-muted-foreground">
            Configurez les paramètres de génération de contenu SEO pour cette
            boutique
          </p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => fetchSettings()}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Paramètres SEO</h1>
        <p className="text-muted-foreground">
          Configurez les paramètres de génération de contenu SEO pour cette
          boutique
        </p>
      </div>

      <SettingsForm
        key={settings?.id ?? "new"}
        defaultValues={settings}
        onSubmit={handleSubmit}
        isSaving={isSaving}
      />
    </div>
  );
}
