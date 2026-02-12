"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import type { ShopifyProduct } from "@seo-facile-de-ouf/shared/src/shopify-products";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type BulkGenerationType =
  | "full_description"
  | "seoTitle"
  | "seoDescription";

export type BulkJobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface BulkJobContent {
  title?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
}

export interface BulkJobState {
  productId: string;
  productName: string;
  jobId: string;
  status: BulkJobStatus;
  content: BulkJobContent | null;
  error: string | null;
}

interface BulkGenerateParams {
  products: ShopifyProduct[];
  shopId: string;
  type: BulkGenerationType;
  storeSettings?: {
    nicheKeyword: string;
    nicheDescription: string;
    language: string;
    productWordCount: number;
    customerPersona: string;
  } | null;
}

interface BulkGenerateResponse {
  success: boolean;
  count: number;
  jobs: { productId: string; jobId: string }[];
}

interface SSEPayload {
  jobId: string;
  status: BulkJobStatus;
  content?: BulkJobContent;
  error?: string;
}

export function useBulkGeneration() {
  const [jobStates, setJobStates] = useState<Map<string, BulkJobState>>(
    new Map()
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationType, setGenerationType] =
    useState<BulkGenerationType | null>(null);
  const eventSourcesRef = useRef<Map<string, EventSource>>(new Map());

  const updateJobState = useCallback(
    (productId: string, update: Partial<BulkJobState>) => {
      setJobStates((prev) => {
        const next = new Map(prev);
        const current = next.get(productId);
        if (current) {
          next.set(productId, { ...current, ...update });
        }
        return next;
      });
    },
    []
  );

  const closeEventSource = useCallback((jobId: string) => {
    const es = eventSourcesRef.current.get(jobId);
    if (es) {
      es.close();
      eventSourcesRef.current.delete(jobId);
    }
  }, []);

  const closeAllEventSources = useCallback(() => {
    eventSourcesRef.current.forEach((es) => es.close());
    eventSourcesRef.current.clear();
  }, []);

  const openSSEForJob = useCallback(
    (jobId: string, productId: string) => {
      const eventSource = new EventSource(
        `${API_BASE_URL}/generations/job/${jobId}/stream`,
        { withCredentials: true }
      );
      eventSourcesRef.current.set(jobId, eventSource);

      eventSource.onmessage = (event) => {
        try {
          const payload: SSEPayload = JSON.parse(event.data);

          if (payload.status === "completed") {
            updateJobState(productId, {
              status: "completed",
              content: payload.content || null,
            });
            closeEventSource(jobId);
          } else if (payload.status === "failed") {
            updateJobState(productId, {
              status: "failed",
              error: payload.error || "Generation failed",
            });
            closeEventSource(jobId);
          } else {
            updateJobState(productId, { status: payload.status });
          }
        } catch {
          // Ignore parse errors
        }
      };

      eventSource.onerror = () => {
        closeEventSource(jobId);
      };
    },
    [updateJobState, closeEventSource]
  );

  const generateBulk = useCallback(
    async ({ products, shopId, type, storeSettings }: BulkGenerateParams) => {
      closeAllEventSources();
      setIsGenerating(true);
      setGenerationType(type);

      // Initialize job states for all products
      const initial = new Map<string, BulkJobState>();
      products.forEach((p) => {
        initial.set(p.id, {
          productId: p.id,
          productName: p.title,
          jobId: "",
          status: "pending",
          content: null,
          error: null,
        });
      });
      setJobStates(initial);

      try {
        const payload = {
          products: products.map((p) => ({
            id: p.id,
            name: p.title,
            keywords: p.tags || [],
            productContext: {
              title: p.title,
              tags: p.tags,
              vendor: p.vendor,
              productType: p.productType,
              price: p.price,
              currentDescription: p.descriptionHtml,
            },
          })),
          shopId,
          type,
          storeSettings: storeSettings || undefined,
        };

        const response = await apiFetch<BulkGenerateResponse>(
          "/generations/generate/bulk",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        // Update job states with jobIds and open SSE connections
        response.jobs.forEach(({ productId, jobId }) => {
          updateJobState(productId, { jobId });
          openSSEForJob(jobId, productId);
        });

        return response;
      } catch (err) {
        // Mark all as failed
        setJobStates((prev) => {
          const next = new Map(prev);
          next.forEach((state, key) => {
            next.set(key, {
              ...state,
              status: "failed",
              error:
                err instanceof Error
                  ? err.message
                  : "Erreur lors de la generation",
            });
          });
          return next;
        });
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    [closeAllEventSources, updateJobState, openSSEForJob]
  );

  const reset = useCallback(() => {
    closeAllEventSources();
    setJobStates(new Map());
    setGenerationType(null);
    setIsGenerating(false);
  }, [closeAllEventSources]);

  // Derived values
  const jobStatesArray = Array.from(jobStates.values());
  const totalCount = jobStatesArray.length;
  const completedCount = jobStatesArray.filter(
    (j) => j.status === "completed"
  ).length;
  const failedCount = jobStatesArray.filter(
    (j) => j.status === "failed"
  ).length;
  const doneCount = completedCount + failedCount;
  const hasActiveJobs = totalCount > 0 && doneCount < totalCount;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      eventSourcesRef.current.forEach((es) => es.close());
      eventSourcesRef.current.clear();
    };
  }, []);

  return {
    generateBulk,
    jobStates,
    jobStatesArray,
    generationType,
    isGenerating,
    totalCount,
    completedCount,
    failedCount,
    doneCount,
    hasActiveJobs,
    reset,
  };
}
