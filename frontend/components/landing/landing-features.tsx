import {
  Brain,
  FileText,
  Layers,
  PenTool,
  RefreshCw,
  Settings2,
  Store,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Store,
    title: "Multi-boutiques",
    description:
      "Gérez toutes vos boutiques Shopify depuis un seul compte. Idéal pour les agences et les marchands multi-marques.",
  },
  {
    icon: RefreshCw,
    title: "Sync Shopify",
    description:
      "Synchronisation bidirectionnelle de vos produits et collections via l'API GraphQL Shopify.",
  },
  {
    icon: Zap,
    title: "Génération temps réel",
    description:
      "Suivez la génération en direct grâce au streaming SSE. Le contenu apparaît au fur et à mesure.",
  },
  {
    icon: Settings2,
    title: "Personnalisation SEO",
    description:
      "Configurez la niche, la langue, le persona client et le nombre de mots cible par boutique.",
  },
  {
    icon: FileText,
    title: "Contenu complet",
    description:
      "Description produit, meta-titre, meta-description et slug URL générés en une seule opération.",
  },
  {
    icon: Layers,
    title: "Génération en masse",
    description:
      "Traitez jusqu'à 50 produits simultanément. Chaque job est indépendant et parallélisable.",
  },
  {
    icon: PenTool,
    title: "Éditeur riche",
    description:
      "Éditeur WYSIWYG intégré avec mise en forme, mode HTML et compteur de mots en temps réel.",
  },
  {
    icon: Brain,
    title: "IA de pointe",
    description:
      "GPT-4o et Claude génèrent du contenu professionnel, structuré et optimisé pour le référencement.",
  },
];

export default function LandingFeatures() {
  return (
    <section id="fonctionnalites" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Fonctionnalités
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Tout ce qu&apos;il faut pour un SEO parfait
          </h2>
          <p className="mt-4 text-muted-foreground">
            De la synchronisation Shopify à la publication, SEO Facile couvre
            l&apos;ensemble du workflow SEO e-commerce.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="size-5 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
