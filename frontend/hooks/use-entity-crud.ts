"use client";

import { useState, useCallback } from "react";
import { apiFetch, ApiError } from "@/lib/api";

interface UseEntityCRUDOptions<T> {
  endpoint: string;
  entityName: string;
  extractEntity: (response: any) => T;
}

export function useEntityCRUD<T, UpdateInput>({
  endpoint,
  entityName,
  extractEntity,
}: UseEntityCRUDOptions<T>) {
  const [entity, setEntity] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback(
    (err: unknown, action: string) => {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(`Failed to ${action} ${entityName}`);
      }
      console.error(`Failed to ${action} ${entityName}:`, err);
    },
    [entityName],
  );

  const fetchEntity = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiFetch<T>(endpoint);
      setEntity(data);
    } catch (err) {
      handleError(err, "load");
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, handleError]);

  const updateEntity = useCallback(
    async (data: UpdateInput) => {
      setIsSaving(true);
      setError(null);

      try {
        const response = await apiFetch(endpoint, {
          method: "PATCH",
          body: JSON.stringify(data),
        });

        setEntity(extractEntity(response));
        return response;
      } catch (err) {
        handleError(err, "update");
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [endpoint, extractEntity, handleError],
  );

  const publishEntity = useCallback(
    async (data: UpdateInput) => {
      setIsPublishing(true);
      setError(null);

      try {
        const response = await apiFetch(`${endpoint}/publish`, {
          method: "POST",
          body: JSON.stringify(data),
        });

        setEntity(extractEntity(response));
        return response;
      } catch (err) {
        handleError(err, "publish");
        throw err;
      } finally {
        setIsPublishing(false);
      }
    },
    [endpoint, extractEntity, handleError],
  );

  const syncEntity = useCallback(async () => {
    setIsSyncing(true);
    setError(null);

    try {
      const response = await apiFetch(`${endpoint}/sync`, { method: "POST" });

      setEntity(extractEntity(response));
      return response;
    } catch (err) {
      handleError(err, "sync");
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [endpoint, extractEntity, handleError]);

  return {
    entity,
    isLoading,
    isSaving,
    isPublishing,
    isSyncing,
    error,
    fetchEntity,
    updateEntity,
    publishEntity,
    syncEntity,
  };
}
