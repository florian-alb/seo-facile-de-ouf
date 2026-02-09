import { Link2, Send, Settings, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    icon: Link2,
    title: "Connectez votre boutique",
    description:
      "Ajoutez vos identifiants Shopify (Client ID et Client Secret). L'authentification OAuth est automatique et vos données sont chiffrées en AES-256.",
  },
  {
    icon: Settings,
    title: "Configurez vos paramètres SEO",
    description:
      "Définissez votre niche, langue, persona client et nombre de mots cible. Ces paramètres guident l'IA pour un contenu parfaitement adapté.",
  },
  {
    icon: Sparkles,
    title: "Générez votre contenu",
    description:
      "Cliquez sur \"Générer\" et regardez l'IA écrire en temps réel. Description, meta-titre, meta-description et slug en quelques secondes.",
  },
  {
    icon: Send,
    title: "Publiez sur Shopify",
    description:
      "Relisez, éditez si besoin dans l'éditeur riche, puis publiez directement sur votre boutique Shopify en un clic.",
  },
];

export default function LandingHowItWorks() {
  return (
    <section className="bg-muted/20 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Comment ça marche
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            4 étapes pour un SEO optimisé
          </h2>
          <p className="mt-4 text-muted-foreground">
            De la connexion à la publication, tout se fait depuis une seule
            interface.
          </p>
        </div>

        {/* Steps */}
        <div className="mx-auto max-w-3xl">
          <div className="relative space-y-12">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 hidden h-full w-px bg-border md:block" />

            {steps.map((step, index) => (
              <div key={step.title} className="relative flex gap-6">
                {/* Number circle */}
                <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </div>

                {/* Content */}
                <div className="pb-2">
                  <div className="mb-1 flex items-center gap-2">
                    <step.icon className="size-4 text-primary" />
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
