import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

interface Generation {
  _id: string;
  productName: string;
  fieldType: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
}

interface RecentGenerationsProps {
  generations: Generation[];
  className?: string;
}

const statusMap: Record<
  Generation["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  completed: { label: "Complété", variant: "default" },
  processing: { label: "En cours", variant: "secondary" },
  pending: { label: "En attente", variant: "outline" },
  failed: { label: "Échoué", variant: "destructive" },
};

const fieldTypeMap: Record<string, string> = {
  full_description: "Complète",
  description: "Description",
  seoTitle: "Meta-titre",
  seoDescription: "Meta-description",
  meta_only: "Meta",
  slug_only: "Slug",
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DashboardRecentGenerations({
  generations,
  className,
}: RecentGenerationsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Générations récentes</CardTitle>
        <CardDescription>
          Vos 10 dernières générations de contenu IA
        </CardDescription>
      </CardHeader>
      <CardContent>
        {generations.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Sparkles />
              </EmptyMedia>
              <EmptyTitle>Aucune génération</EmptyTitle>
              <EmptyDescription>
                Ouvrez un produit et cliquez sur &quot;Générer&quot; pour créer
                votre premier contenu SEO.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {generations.map((gen) => {
                const status = statusMap[gen.status];
                return (
                  <TableRow key={gen._id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {gen.productName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {fieldTypeMap[gen.fieldType] || gen.fieldType}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDate(gen.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
