"use client";

import { Sparkles, Save, Upload, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActionCardProps {
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  onSave: () => void;
  onPublish: () => void;
  onCancel: () => void;
  onGenerate: () => void;
  shake?: boolean;
}

export function ActionCard({
  isDirty,
  isSaving,
  isPublishing,
  onSave,
  onPublish,
  onCancel,
  onGenerate,
  shake = false,
}: ActionCardProps) {
  const isDisabled = isSaving || isPublishing;

  const handleGenerateClick = () => {
    toast.info("Fonctionnalité à venir", {
      description:
        "La génération IA de tous les champs sera disponible dans une prochaine version.",
    });
    onGenerate();
  };

  return (
    <Card
      size="sm"
      className={cn(
        "sticky top-4 transition-all z-100",
        shake && "animate-shake",
        isDirty && "ring-2 ring-primary/50"
      )}
    >
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Generate All Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start"
          onClick={handleGenerateClick}
          disabled={isDisabled}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Générer
        </Button>

        <div className="border-t border-border pt-3 space-y-2">
          {/* Cancel Button - Only visible when dirty */}
          {isDirty && (
            <Button
              type="button"
              variant="destructive"
              className="w-full justify-start text-muted-foreground"
              onClick={onCancel}
              disabled={isDisabled}
            >
              <Undo2 className="h-4 w-4 mr-2" />
              Annuler les modifications
            </Button>
          )}

          {/* Save Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
            onClick={onSave}
            disabled={isDisabled || !isDirty}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </Button>

          {/* Publish Button */}
          <Button
            type="button"
            className="w-full justify-start"
            onClick={onPublish}
            disabled={isDisabled || !isDirty}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isPublishing ? "Publication..." : "Enregistrer et publier"}
          </Button>
        </div>

        {/* Unsaved changes indicator */}
        {isDirty && (
          <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
            Vous avez des modifications non enregistrées
          </p>
        )}
      </CardContent>
    </Card>
  );
}
