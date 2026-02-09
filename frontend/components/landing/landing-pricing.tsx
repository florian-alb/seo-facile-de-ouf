import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const plans = [
  {
    name: "Gratuit",
    price: "0€",
    period: "/mois",
    description: "Pour découvrir SEO Facile et tester la génération IA.",
    popular: false,
    features: [
      "20 générations / mois",
      "1 boutique Shopify",
      "Tous les types de contenu",
      "Éditeur riche intégré",
      "Support par email",
    ],
    cta: "Commencer gratuitement",
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "29€",
    period: "/mois",
    description: "Pour les marchands qui veulent scaler leur SEO.",
    popular: true,
    features: [
      "Générations illimitées",
      "5 boutiques Shopify",
      "Génération en masse (50 produits)",
      "Streaming temps réel",
      "Support prioritaire",
    ],
    cta: "Essayer Pro",
    variant: "default" as const,
  },
  {
    name: "Agence",
    price: "79€",
    period: "/mois",
    description: "Pour les agences SEO et les marchands multi-marques.",
    popular: false,
    features: [
      "Générations illimitées",
      "Boutiques illimitées",
      "Génération en masse (50 produits)",
      "Accès API",
      "Account manager dédié",
    ],
    cta: "Contacter l'équipe",
    variant: "outline" as const,
  },
];

export default function LandingPricing() {
  return (
    <section id="tarifs" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Tarifs
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Un plan pour chaque besoin
          </h2>
          <p className="mt-4 text-muted-foreground">
            Commencez gratuitement, puis passez à l&apos;échelle quand votre
            catalogue grandit.
          </p>
        </div>

        {/* Cards */}
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.popular ? "relative ring-2 ring-primary" : undefined
              }
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>Populaire</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={plan.variant}
                  className="w-full"
                  asChild
                >
                  <Link href="/auth/register">{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
