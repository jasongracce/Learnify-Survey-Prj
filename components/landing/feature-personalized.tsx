"use client";

import { useLanguage } from "@/lib/i18n";
import Reveal from "./reveal";

export default function FeaturePersonalized() {
  const { t, language } = useLanguage();
  const feature = t.features.personalized;
  const mockupSrc =
    language === "th"
      ? "/personalized-mockup-th.png"
      : "/personalized-mockup.png";

  return (
    <section className="relative w-full overflow-hidden bg-[#f9f9f7] py-14 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-[#1a1a1a] p-8 md:p-12 lg:p-16">
            <div className="relative grid grid-cols-1 items-center gap-8 md:gap-10 lg:grid-cols-2 lg:gap-16">
              {/* Phone mockup */}
              <div className="flex justify-center lg:justify-start">
                <div
                  className="relative w-full max-w-md overflow-hidden rounded-3xl ring-1 ring-white/10 rotate-[-2deg] md:rotate-[-4deg]"
                  style={{
                    boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={mockupSrc}
                    src={mockupSrc}
                    alt="Personalized learning mockup"
                    className="block h-auto w-full"
                  />
                </div>
              </div>

              {/* Text */}
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-[0.2em] text-white/60">
                  {feature.number}
                </span>
                <h2 className="mt-3 text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {feature.title}
                </h2>
                <div className="mt-5 h-0.5 w-12 bg-white" aria-hidden />
                <p className="mt-6 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
