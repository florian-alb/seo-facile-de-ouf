import LandingNavbar from "@/components/landing/landing-navbar";
import LandingHero from "@/components/landing/landing-hero";
import LandingStats from "@/components/landing/landing-stats";
import LandingFeatures from "@/components/landing/landing-features";
import LandingHowItWorks from "@/components/landing/landing-how-it-works";
import LandingPricing from "@/components/landing/landing-pricing";
import LandingFaq from "@/components/landing/landing-faq";
import LandingCta from "@/components/landing/landing-cta";
import LandingFooter from "@/components/landing/landing-footer";

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingStats />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingPricing />
        <LandingFaq />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
