import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingCta() {
  return (
    <section className="relative overflow-hidden py-24">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,var(--color-primary)/0.08,transparent_70%)]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Prêt à booster votre SEO Shopify ?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Rejoignez les marchands qui gagnent des heures de rédaction chaque
            semaine grâce à EasySEO.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/auth/register">
                Commencer gratuitement
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="mailto:contact@seofacile.fr">
                Contacter l&apos;équipe
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Aucune carte bancaire requise &middot; Annulation à tout moment
          </p>
        </div>
      </div>
    </section>
  );
}
