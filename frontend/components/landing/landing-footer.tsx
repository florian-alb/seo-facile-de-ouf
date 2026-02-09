import Link from "next/link";
import { Leaf } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = [
  {
    title: "Produit",
    links: [
      { label: "Fonctionnalités", href: "#fonctionnalites" },
      { label: "Tarifs", href: "#tarifs" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Blog", href: "#" },
      { label: "API", href: "#" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "CGU", href: "#" },
      { label: "Confidentialité", href: "#" },
      { label: "Contact", href: "mailto:contact@seofacile.fr" },
    ],
  },
];

export default function LandingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg"
            >
              <Leaf className="size-5 text-primary" />
              SEO Facile
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Générez du contenu SEO optimisé pour vos produits Shopify grâce à
              l&apos;IA.
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 text-sm font-semibold">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SEO Facile. Tous droits réservés.
          </p>
          <p className="text-xs text-muted-foreground">
            Fait avec soin en France
          </p>
        </div>
      </div>
    </footer>
  );
}
