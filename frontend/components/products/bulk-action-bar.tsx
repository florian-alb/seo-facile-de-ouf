"use client";

import { useState, useCallback } from "react";
import {
  X,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
  Save,
  Upload,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";
import type {
  BulkGenerationType,
  BulkJobState,
  BulkJobContent,
} from "@/hooks/use-bulk-generation";

interface BulkActionBarProps {
  selectedCount: number;
  storeId: string;
  onClearSelection: () => void;
  onBulkGenerate: (type: BulkGenerationType) => void;
  isGenerating: boolean;
  // Tracking mode
  jobStates: BulkJobState[];
  generationType: BulkGenerationType | null;
  totalCount: number;
  completedCount: number;
  failedCount: number;
  doneCount: number;
  hasActiveJobs: boolean;
  onReset: () => void;
}

const GENERATION_LABELS: Record<BulkGenerationType, string> = {
  full_description: "Generation complete",
  seoTitle: "Titre SEO",
  seoDescription: "Description SEO",
};

function getContentFieldsForType(
  type: BulkGenerationType,
  content: BulkJobContent
): Record<string, string> {
  const fields: Record<string, string> = {};
  if (
    type === "full_description" ||
    type === "seoTitle"
  ) {
    if (content.metaTitle) fields["Titre SEO"] = content.metaTitle;
  }
  if (
    type === "full_description" ||
    type === "seoDescription"
  ) {
    if (content.metaDescription)
      fields["Description SEO"] = content.metaDescription;
  }
  if (type === "full_description") {
    if (content.description) fields["Description"] = content.description;
  }
  return fields;
}

function buildUpdatePayload(
  type: BulkGenerationType,
  content: BulkJobContent
) {
  const payload: Record<string, string> = {};
  if (
    (type === "full_description" || type === "seoTitle") &&
    content.metaTitle
  ) {
    payload.seoTitle = content.metaTitle;
  }
  if (
    (type === "full_description" || type === "seoDescription") &&
    content.metaDescription
  ) {
    payload.seoDescription = content.metaDescription;
  }
  if (type === "full_description" && content.description) {
    payload.descriptionHtml = content.description;
  }
  return payload;
}

function StatusBadge({ status }: { status: BulkJobState["status"] }) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="secondary" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          En attente
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          En cours
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <Check className="h-3 w-3" />
          Termine
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Echoue
        </Badge>
      );
  }
}

function JobContentDialog({
  open,
  onOpenChange,
  productName,
  contentFields,
  generationType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  contentFields: Record<string, string>;
  generationType: BulkGenerationType;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{productName}</DialogTitle>
          <DialogDescription>
            {GENERATION_LABELS[generationType]} — Contenu genere
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {Object.entries(contentFields).map(([label, value]) => (
            <div key={label} className="space-y-1.5">
              <h4 className="text-sm font-medium text-muted-foreground">
                {label}
              </h4>
              {label === "Description" ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none rounded-md border p-3 bg-muted/30"
                  dangerouslySetInnerHTML={{ __html: value }}
                />
              ) : (
                <p className="text-sm rounded-md border p-3 bg-muted/30 whitespace-pre-wrap wrap-break-word">
                  {value}
                </p>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const JOB_ROW_GRID = "grid grid-cols-[2fr_auto_1fr_auto] gap-4 items-center px-4 py-2.5";

function JobRow({
  job,
  storeId,
  generationType,
}: {
  job: BulkJobState;
  storeId: string;
  generationType: BulkGenerationType;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [published, setPublished] = useState(false);

  const handleSave = async () => {
    if (!job.content) return;
    setIsSaving(true);
    try {
      const payload = buildUpdatePayload(generationType, job.content);
      await apiFetch(`/shops/${storeId}/products/${job.productId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setSaved(true);
      toast.success(`${job.productName} sauvegarde`);
    } catch {
      toast.error(`Erreur lors de la sauvegarde de ${job.productName}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!job.content) return;
    setIsPublishing(true);
    try {
      const payload = buildUpdatePayload(generationType, job.content);
      await apiFetch(`/shops/${storeId}/products/${job.productId}/publish`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setPublished(true);
      toast.success(`${job.productName} publie sur Shopify`);
    } catch {
      toast.error(`Erreur lors de la publication de ${job.productName}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const contentFields =
    job.content && job.status === "completed"
      ? getContentFieldsForType(generationType, job.content)
      : null;

  const previewSnippet = contentFields
    ? Object.values(contentFields)[0]?.substring(0, 80)
    : null;

  return (
    <>
      <div className={`${JOB_ROW_GRID} border-b last:border-b-0 hover:bg-muted/30`}>
        {/* Product name */}
        <span className="text-sm font-medium truncate min-w-0">
          {job.productName}
        </span>

        {/* Status */}
        <StatusBadge status={job.status} />

        {/* Preview snippet */}
        <div className="text-xs text-muted-foreground truncate min-w-0">
          {job.status === "completed" && previewSnippet ? (
            <span className="truncate">{previewSnippet}...</span>
          ) : job.status === "failed" && job.error ? (
            <span className="text-destructive truncate">{job.error}</span>
          ) : (
            <span>—</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {job.status === "completed" && contentFields && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2"
                onClick={handleSave}
                disabled={isSaving || saved}
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : saved ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2"
                onClick={handlePublish}
                disabled={isPublishing || published}
              >
                {isPublishing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : published ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content Preview Dialog */}
      {contentFields && (
        <JobContentDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          productName={job.productName}
          contentFields={contentFields}
          generationType={generationType}
        />
      )}
    </>
  );
}

export function BulkActionBar({
  selectedCount,
  storeId,
  onClearSelection,
  onBulkGenerate,
  isGenerating,
  jobStates,
  generationType,
  totalCount,
  completedCount,
  failedCount,
  doneCount,
  hasActiveJobs,
  onReset,
}: BulkActionBarProps) {
  const [trackingExpanded, setTrackingExpanded] = useState(true);
  const isTracking = totalCount > 0;
  const completedJobs = jobStates.filter((j) => j.status === "completed");

  const handleSaveAll = useCallback(async () => {
    if (!generationType || completedJobs.length === 0) return;

    const results = await Promise.allSettled(
      completedJobs.map(async (job) => {
        if (!job.content) return;
        const payload = buildUpdatePayload(generationType, job.content);
        return apiFetch(`/shops/${storeId}/products/${job.productId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      })
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    if (failed === 0) {
      toast.success(`${succeeded} produit${succeeded > 1 ? "s" : ""} sauvegarde${succeeded > 1 ? "s" : ""}`);
    } else {
      toast.error(`${succeeded} sauvegarde${succeeded > 1 ? "s" : ""}, ${failed} echoue${failed > 1 ? "s" : ""}`);
    }
  }, [generationType, completedJobs, storeId]);

  const handlePublishAll = useCallback(async () => {
    if (!generationType || completedJobs.length === 0) return;

    const results = await Promise.allSettled(
      completedJobs.map(async (job) => {
        if (!job.content) return;
        const payload = buildUpdatePayload(generationType, job.content);
        return apiFetch(
          `/shops/${storeId}/products/${job.productId}/publish`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
      })
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    if (failed === 0) {
      toast.success(`${succeeded} produit${succeeded > 1 ? "s" : ""} publie${succeeded > 1 ? "s" : ""} sur Shopify`);
    } else {
      toast.error(`${succeeded} publie${succeeded > 1 ? "s" : ""}, ${failed} echoue${failed > 1 ? "s" : ""}`);
    }
  }, [generationType, completedJobs, storeId]);

  const handleClose = useCallback(() => {
    onReset();
    onClearSelection();
  }, [onReset, onClearSelection]);

  // Nothing to show
  if (selectedCount === 0 && !isTracking) return null;

  // Mode 2: Tracking active generations
  if (isTracking) {
    return (
      <Collapsible open={trackingExpanded} onOpenChange={setTrackingExpanded}>
        <div className="rounded-lg border bg-background">
          {/* Header */}
          <div className="flex items-center gap-4 px-4 py-3">
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {generationType && GENERATION_LABELS[generationType]}
                </span>
                <Badge variant="secondary">
                  {doneCount}/{totalCount} termine{doneCount > 1 ? "s" : ""}
                </Badge>
                {completedCount > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {completedCount} reussi{completedCount > 1 ? "s" : ""}
                  </Badge>
                )}
                {failedCount > 0 && (
                  <Badge variant="destructive">
                    {failedCount} echoue{failedCount > 1 ? "s" : ""}
                  </Badge>
                )}
                {hasActiveJobs && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                )}
              </div>
              <Progress value={totalCount > 0 ? (doneCount / totalCount) * 100 : 0} />
            </div>

            <div className="flex items-center gap-2">
              {completedJobs.length > 0 && !hasActiveJobs && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveAll}
                  >
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    Tout sauvegarder ({completedJobs.length})
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handlePublishAll}
                  >
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Tout publier ({completedJobs.length})
                  </Button>
                </>
              )}

              <CollapsibleTrigger asChild>
                <Button size="sm" variant="ghost" className="h-7 px-2">
                  {trackingExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2"
                onClick={handleClose}
                disabled={hasActiveJobs}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Job list */}
          <CollapsibleContent>
            {/* Table header */}
            <div className={`${JOB_ROW_GRID} border-t border-b bg-muted/50 text-xs font-medium text-muted-foreground`}>
              <span>Produit</span>
              <span>Statut</span>
              <span>Apercu</span>
              <span>Actions</span>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {jobStates.map((job) => (
                <JobRow
                  key={job.productId}
                  job={job}
                  storeId={storeId}
                  generationType={generationType!}
                />
              ))}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }

  // Mode 1: Selection (no generation running)
  return (
    <div className="rounded-lg border bg-background px-4 py-3 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium whitespace-nowrap">
          {selectedCount} produit{selectedCount > 1 ? "s" : ""} selectionne
          {selectedCount > 1 ? "s" : ""}
        </span>

        <div className="h-6 w-px bg-border" />

        <Button
          size="sm"
          variant="outline"
          onClick={() => onBulkGenerate("full_description")}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-1.5" />
          )}
          Generation complete
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onBulkGenerate("seoTitle")}
          disabled={isGenerating}
        >
          Titre SEO
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onBulkGenerate("seoDescription")}
          disabled={isGenerating}
        >
          Description SEO
        </Button>

        <div className="h-6 w-px bg-border" />

        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          disabled={isGenerating}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
