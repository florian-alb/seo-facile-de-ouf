"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface EntityTabsProps {
  basePath: string;
}

export function EntityTabs({ basePath }: EntityTabsProps) {
  const pathname = usePathname();
  const isHistoryTab = pathname.startsWith(`${basePath}/history`);

  const tabs = [
    { label: "Détails", href: basePath, active: !isHistoryTab },
    {
      label: "Historique",
      href: `${basePath}/history`,
      active: isHistoryTab,
    },
  ];

  return (
    <nav className="flex gap-1 border-b">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            tab.active
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
