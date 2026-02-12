"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SeoEasyLogo } from "@/components/icons/logo-easy-seo";

const navLinks = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <SeoEasyLogo className="size-8! rounded-lg aspect-square" />
          EasySEO
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            <Sun className="size-4 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-4 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Changer le thème</span>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/auth/login">Connexion</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/register">Commencer</Link>
          </Button>
        </div>

        {/* Mobile menu */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            <Sun className="size-4 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-4 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Changer le thème</span>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="size-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <SeoEasyLogo className="size-8! rounded-lg aspect-square" />
                  EasySEO
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 px-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-4 flex flex-col gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/auth/login">Connexion</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth/register">Commencer</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
