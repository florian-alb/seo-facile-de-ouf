"use client";

import { useState, useCallback } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type {
  GenerationHistoryItem,
  GenerationDetail,
} from "@seo-facile-de-ouf/shared/src/generation";

interface GenerationsResponse {
  success: boolean;
  data: GenerationHistoryItem[];
}

export function useGenerationHistory(
  entityType: "product" | "collection",
  entityId: string
) {
  const [generations, setGenerations] = useState<GenerationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGenerations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const endpoint =
        entityType === "product"
          ? `/generations/product/${entityId}`
          : `/generations/collection/${entityId}`;

      const data = await apiFetch<GenerationsResponse>(endpoint);
      setGenerations(data.data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load generation history");
      }
    } finally {
      setIsLoading(false);
    }
  }, [entityType, entityId]);

  return { generations, isLoading, error, fetchGenerations };
}

export function useGenerationDetail(generationId: string) {
  const [generation, setGeneration] = useState<GenerationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGeneration = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiFetch<GenerationDetail>(
        `/generations/${generationId}`
      );
      setGeneration(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load generation details");
      }
    } finally {
      setIsLoading(false);
    }
  }, [generationId]);

  return { generation, isLoading, error, fetchGeneration };
}
