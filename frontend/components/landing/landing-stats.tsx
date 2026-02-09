const stats = [
  { value: "< 30s", label: "par fiche produit" },
  { value: "10×", label: "plus rapide" },
  { value: "60%", label: "d'économies" },
  { value: "50", label: "produits en bulk" },
];

export default function LandingStats() {
  return (
    <section className="border-y bg-muted/30 py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl font-bold text-primary sm:text-4xl">
              {stat.value}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
