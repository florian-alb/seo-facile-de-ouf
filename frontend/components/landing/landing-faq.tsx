"use client";

import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Quels modèles d'IA sont utilisés ?",
    answer:
      "SEO Facile utilise GPT-4o d'OpenAI et Claude d'Anthropic pour générer du contenu SEO de qualité professionnelle. L'architecture multi-modèle permet de choisir le meilleur modèle selon le type de contenu : les descriptions longues, les meta-titres courts, etc.",
  },
  {
    question: "Faut-il des connaissances techniques pour utiliser SEO Facile ?",
    answer:
      "Non, aucune connaissance technique n'est requise. Vous connectez votre boutique Shopify avec vos identifiants API (Client ID et Client Secret disponibles dans votre admin Shopify), configurez vos préférences SEO, et l'IA fait le reste.",
  },
  {
    question: "Comment fonctionne la synchronisation avec Shopify ?",
    answer:
      "SEO Facile se connecte à votre boutique via l'API GraphQL de Shopify. Vos produits et collections sont synchronisés en un clic, avec toutes leurs informations (titre, description, prix, images, tags). Vous pouvez ensuite publier les modifications directement depuis SEO Facile.",
  },
  {
    question: "Puis-je personnaliser le style du contenu généré ?",
    answer:
      "Oui, chaque boutique dispose de paramètres SEO dédiés : mot-clé de niche, description du positionnement, langue, persona client et nombre de mots cible. L'IA adapte le ton, le vocabulaire et la structure du contenu en fonction de ces paramètres.",
  },
  {
    question: "Le contenu généré est-il unique ?",
    answer:
      "Oui, chaque contenu est généré individuellement en tenant compte du contexte spécifique du produit (titre, tags, vendeur, prix, description actuelle) et des paramètres de votre boutique. Deux produits différents produiront toujours des contenus différents.",
  },
  {
    question: "Puis-je annuler mon abonnement à tout moment ?",
    answer:
      "Oui, tous nos plans sont sans engagement. Vous pouvez annuler à tout moment depuis votre espace client. Votre accès reste actif jusqu'à la fin de la période en cours.",
  },
];

export default function LandingFaq() {
  return (
    <section id="faq" className="scroll-mt-20 bg-muted/20 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            FAQ
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Questions fréquentes
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tout ce que vous devez savoir sur SEO Facile.
          </p>
        </div>

        {/* Accordion */}
        <div className="mx-auto max-w-2xl">
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>
                  <p>{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
