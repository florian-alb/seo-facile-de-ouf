"use client";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Field, FieldError } from "@/components/ui/field";

interface GeneratableFieldProps {
  title: string;
  value: string;
  error?: string;
  disabled?: boolean;
  showCounter?: boolean;
  onGenerate: () => void;
  children: React.ReactNode;
}

function countWords(text: string): number {
  const cleaned = text.replace(/<[^>]*>/g, "").trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).length;
}

export function GeneratableField({
  title,
  value,
  error,
  disabled,
  showCounter = true,
  onGenerate,
  children,
}: GeneratableFieldProps) {
  const characterCount = value.replace(/<[^>]*>/g, "").length;
  const wordCount = countWords(value);

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardAction>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onGenerate}
            disabled={disabled}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Générer
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Field>
          {children}
          <div className="flex items-center justify-between">
            {error ? (
              <FieldError>{error}</FieldError>
            ) : (
              <span />
            )}
            {showCounter && (
              <span className="text-xs text-muted-foreground">
                {wordCount} mots · {characterCount} caractères
              </span>
            )}
          </div>
        </Field>
      </CardContent>
    </Card>
  );
}
