import { FolderOpen, Package, Sparkles, Store } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatsCardsProps {
  connectedStores: number;
  totalProducts: number;
  totalCollections: number;
  completedGenerations: number;
}

const statsConfig = [
  {
    key: "stores" as const,
    label: "Boutiques connectées",
    icon: Store,
    prop: "connectedStores" as const,
  },
  {
    key: "products" as const,
    label: "Produits",
    icon: Package,
    prop: "totalProducts" as const,
  },
  {
    key: "collections" as const,
    label: "Collections",
    icon: FolderOpen,
    prop: "totalCollections" as const,
  },
  {
    key: "generations" as const,
    label: "Générations complétées",
    icon: Sparkles,
    prop: "completedGenerations" as const,
  },
];

export function DashboardStatsCards(props: StatsCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      {statsConfig.map((stat) => (
        <Card key={stat.key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <stat.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{props[stat.prop]}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
