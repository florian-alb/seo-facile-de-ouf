"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface SyncButtonProps {
  onSync: () => void;
  isSyncing: boolean;
  disabled?: boolean;
}

export function SyncButton({ onSync, isSyncing, disabled }: SyncButtonProps) {
  return (
    <Button onClick={onSync} disabled={isSyncing || disabled} size="sm">
      <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
      {isSyncing ? "Synchronisation..." : "Synchroniser les collections"}
    </Button>
  );
}
