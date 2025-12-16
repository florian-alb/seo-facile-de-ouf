"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface AuthProviderButtonProps {
  icon: ReactNode;
  name: string;
  phrase?: string;
  onClick: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "destructive"
    | "link";
  size?:
    | "default"
    | "xs"
    | "sm"
    | "lg"
    | "icon"
    | "icon-xs"
    | "icon-sm"
    | "icon-lg";
}

export function AuthProviderButton({
  icon,
  name,
  phrase,
  onClick,
  loading = false,
  disabled = false,
  className,
  variant = "outline",
  size = "default",
}: AuthProviderButtonProps) {
  const handleClick = async () => {
    if (disabled || loading) return;
    try {
      await onClick();
    } catch (error) {
      console.error(`Error with ${name} authentication:`, error);
    }
  };

  const buttonContent = (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || loading}
      className={cn("cursor-pointer", className)}
      aria-label={phrase || `Sign in with ${name}`}
    >
      <span className="flex items-center justify-center gap-2">
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
        {!phrase && <span className="sr-only">{name}</span>}
      </span>
      {loading && (
        <span className="ml-2" aria-hidden="true">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
    </Button>
  );

  if (phrase) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent>
          <p>{phrase}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return buttonContent;
}
