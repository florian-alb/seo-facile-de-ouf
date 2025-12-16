"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ReactNode, useState } from "react";
import { Spinner } from "./ui/spinner";

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
  const [loadingState, setLoadingState] = useState(loading);

  const handleClick = async () => {
    if (disabled || loading) return;
    try {
      setLoadingState(true);
      await onClick();
    } catch (error) {
      console.error(`Error with ${name} authentication:`, error);
    } finally {
      setLoadingState(false);
    }
  };

  const buttonContent = (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || loadingState}
      className={cn("cursor-pointer", className)}
      aria-label={phrase || `Sign in with ${name}`}
    >
      <span className="flex items-center justify-center gap-2">
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
        {!phrase && <span className="sr-only">{name}</span>}
      </span>
      {loadingState && <Spinner />}
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
