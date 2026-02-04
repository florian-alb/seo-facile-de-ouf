"use client";

import { useState, useCallback } from "react";
import type {
  StoreSettings,
  StoreSettingsInput,
} from "@seo-facile-de-ouf/shared/src/store-settings";
import { apiFetch, ApiError } from "@/lib/api";

export function useStoreSettings(storeId: string) {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiFetch<StoreSettings | null>(
        `/stores/${storeId}/settings`
      );
      setSettings(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Impossible de charger les paramètres");
      }
      console.error("Failed to fetch store settings:", err);
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  const saveSettings = useCallback(
    async (data: StoreSettingsInput) => {
      setIsSaving(true);
      setError(null);

      try {
        const response = await apiFetch<StoreSettings>(
          `/stores/${storeId}/settings`,
          {
            method: "PUT",
            body: JSON.stringify(data),
          }
        );
        setSettings(response);
        return response;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Impossible de sauvegarder les paramètres");
        }
        console.error("Failed to save store settings:", err);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [storeId]
  );

  return {
    settings,
    isLoading,
    isSaving,
    error,
    fetchSettings,
    saveSettings,
  };
}
