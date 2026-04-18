import Header from "@/components/landing/header";
import Hero from "@/components/landing/hero";
import FloatingCards from "@/components/landing/floating-cards";
import StatsBanner from "@/components/landing/stats-banner";
import FeatureActive from "@/components/landing/feature-active";
import FeatureLocalised from "@/components/landing/feature-localised";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f9f9f7]">
      <Header />
      <main>
        <FloatingCards>
          <Hero />
        </FloatingCards>
        <StatsBanner />
        <FeatureActive />
        <FeatureLocalised />
      </main>
    </div>
  );
}
