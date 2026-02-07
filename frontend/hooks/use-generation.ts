"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { apiFetch } from "@/lib/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type FieldType = "description" | "seoTitle" | "seoDescription";
type GenerationStatus = "idle" | "pending" | "processing" | "completed" | "failed";

interface GenerationState {
  jobId: string | null;
  status: GenerationStatus;
  result: string | null;
  error: string | null;
}

interface StartGenerationParams {
  productId: string;
  productName: string;
  shopId: string;
  fieldType: FieldType;
  keywords?: string[];
  storeSettings?: {
    nicheKeyword: string;
    nicheDescription: string;
    language: string;
    productWordCount: number;
    customerPersona: string;
  } | null;
  productContext?: {
    title: string;
    tags: string[];
    vendor: string | null;
    productType: string | null;
    price: number;
    currentDescription: string | null;
  };
}

interface GenerateResponse {
  success: boolean;
  jobId: string;
  status: string;
}

interface SSEPayload {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  content?: {
    title: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
    slug: string;
  };
  error?: string;
}

const FIELD_TO_CONTENT_KEY: Record<FieldType, keyof NonNullable<SSEPayload["content"]>> = {
  description: "description",
  seoTitle: "metaTitle",
  seoDescription: "metaDescription",
};

const initialState: GenerationState = {
  jobId: null,
  status: "idle",
  result: null,
  error: null,
};

export function useFieldGeneration() {
  const [generations, setGenerations] = useState<Record<FieldType, GenerationState>>({
    description: { ...initialState },
    seoTitle: { ...initialState },
    seoDescription: { ...initialState },
  });

  const eventSourceRefs = useRef<Partial<Record<FieldType, EventSource>>>({});

  const updateField = useCallback(
    (fieldType: FieldType, update: Partial<GenerationState>) => {
      setGenerations((prev) => ({
        ...prev,
        [fieldType]: { ...prev[fieldType], ...update },
      }));
    },
    [],
  );

  const closeEventSource = useCallback((fieldType: FieldType) => {
    const es = eventSourceRefs.current[fieldType];
    if (es) {
      es.close();
      delete eventSourceRefs.current[fieldType];
    }
  }, []);

  const startGeneration = useCallback(
    async (params: StartGenerationParams) => {
      const { fieldType } = params;

      // Close any existing SSE connection for this field
      closeEventSource(fieldType);

      // Reset state
      updateField(fieldType, {
        jobId: null,
        status: "pending",
        result: null,
        error: null,
      });

      try {
        // 1. POST to create the job
        const data = await apiFetch<GenerateResponse>(
          "/generations/generate",
          {
            method: "POST",
            body: JSON.stringify({
              productId: params.productId,
              productName: params.productName,
              shopId: params.shopId,
              fieldType: params.fieldType,
              keywords: params.keywords || [],
              storeSettings: params.storeSettings || undefined,
              productContext: params.productContext || undefined,
            }),
          },
        );

        if (!data.success || !data.jobId) {
          updateField(fieldType, {
            status: "failed",
            error: "Failed to create generation job",
          });
          return;
        }

        updateField(fieldType, { jobId: data.jobId });

        // 2. Open SSE connection to stream status updates
        const eventSource = new EventSource(
          `${API_BASE_URL}/generations/job/${data.jobId}/stream`,
          { withCredentials: true },
        );
        eventSourceRefs.current[fieldType] = eventSource;

        eventSource.onmessage = (event) => {
          try {
            const payload: SSEPayload = JSON.parse(event.data);

            if (payload.status === "completed" && payload.content) {
              const contentKey = FIELD_TO_CONTENT_KEY[fieldType];
              const result = payload.content[contentKey] || "";
              updateField(fieldType, { status: "completed", result });
              closeEventSource(fieldType);
            } else if (payload.status === "failed") {
              updateField(fieldType, {
                status: "failed",
                error: payload.error || "Generation failed",
              });
              closeEventSource(fieldType);
            } else {
              updateField(fieldType, { status: payload.status });
            }
          } catch {
            // Ignore parse errors
          }
        };

        eventSource.onerror = () => {
          // EventSource auto-reconnects, but if the connection is
          // closed by the server (terminal state), it won't reconnect
          // Check if we already have a terminal state
          const currentState = generations[fieldType];
          if (
            currentState.status !== "completed" &&
            currentState.status !== "failed"
          ) {
            // Connection error while still waiting - mark as failed
            updateField(fieldType, {
              status: "failed",
              error: "Connection lost",
            });
          }
          closeEventSource(fieldType);
        };
      } catch (err) {
        updateField(fieldType, {
          status: "failed",
          error:
            err instanceof Error ? err.message : "Failed to start generation",
        });
      }
    },
    [updateField, closeEventSource, generations],
  );

  const isGenerating = useCallback(
    (fieldType: FieldType): boolean => {
      const status = generations[fieldType].status;
      return status === "pending" || status === "processing";
    },
    [generations],
  );

  // Cleanup all EventSource connections on unmount
  useEffect(() => {
    return () => {
      Object.keys(eventSourceRefs.current).forEach((key) => {
        const es = eventSourceRefs.current[key as FieldType];
        if (es) es.close();
      });
    };
  }, []);

  return {
    generations,
    startGeneration,
    isGenerating,
  };
}
