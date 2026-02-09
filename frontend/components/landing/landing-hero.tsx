import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-primary)/0.08,transparent_70%)]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text content */}
          <div className="flex flex-col items-start gap-6">
            <Badge variant="secondary" className="gap-1.5">
              <Sparkles className="size-3" />
              Propulsé par GPT-4o & Claude
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Générez vos fiches produits Shopify en{" "}
              <span className="text-primary">30 secondes</span>
            </h1>

            <p className="max-w-lg text-lg text-muted-foreground">
              Descriptions SEO, meta-titres, meta-descriptions et slugs URL
              générés automatiquement par l&apos;IA pour chacun de vos produits
              Shopify.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/auth/register">
                  Commencer gratuitement
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="#fonctionnalites">Voir les fonctionnalités</a>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Aucune carte bancaire requise
            </p>
          </div>

          {/* Mock UI */}
          <div className="relative">
            <Card className="overflow-hidden border bg-card/50 backdrop-blur">
              {/* Terminal header */}
              <div className="flex items-center gap-2 border-b px-4 py-3">
                <div className="size-3 rounded-full bg-red-400" />
                <div className="size-3 rounded-full bg-yellow-400" />
                <div className="size-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-muted-foreground">
                  SEO Facile — Génération en cours
                </span>
              </div>

              {/* Mock content */}
              <div className="space-y-4 p-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-block size-2 animate-pulse rounded-full bg-primary" />
                    Génération de la description produit...
                  </div>
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="h-3 w-3/4 rounded bg-primary/20" />
                    <div className="h-3 w-full rounded bg-primary/15" />
                    <div className="h-3 w-5/6 rounded bg-primary/10" />
                    <div className="h-3 w-2/3 rounded bg-primary/10" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Meta-titre</span>
                    <Badge variant="default" className="text-[10px]">
                      Complété
                    </Badge>
                  </div>
                  <div className="rounded-md border bg-background px-3 py-2 text-sm">
                    Chaussures Running Homme - Confort & Performance | MonShop
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Meta-description
                    </span>
                    <Badge variant="default" className="text-[10px]">
                      Complété
                    </Badge>
                  </div>
                  <div className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                    Découvrez nos chaussures de running pour homme. Amorti
                    optimal, légèreté et design moderne. Livraison gratuite dès
                    50€.
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
