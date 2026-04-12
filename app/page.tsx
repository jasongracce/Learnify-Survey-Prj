import Header from "@/components/landing/header";
import Hero from "@/components/landing/hero";
import FloatingCards from "@/components/landing/floating-cards";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f9f9f7]">
      <Header />
      <main>
        <FloatingCards>
          <Hero />
        </FloatingCards>
      </main>
    </div>
  );
}
