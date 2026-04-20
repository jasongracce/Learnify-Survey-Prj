"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n";
import Reveal from "./reveal";

export default function FeatureActive() {
  const { t, language } = useLanguage();
  const feature = t.features.active;
  const mockupSrc =
    language === "th"
      ? "/active-learning-mockup-th.png"
      : "/active-learning-mockup.png";

  return (
    <section
      id="features"
      className="w-full bg-[#f9f9f7] py-16 md:py-28"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 md:gap-16 lg:grid-cols-2 lg:gap-20">
        {/* Image */}
        <Reveal className="order-1 flex justify-center lg:order-none">
          <div className="relative w-full max-w-md">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div
                className="absolute inset-x-8 inset-y-4 rounded-[2rem] bg-[#e8f4fd] opacity-70 blur-3xl"
                aria-hidden
              />
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm">
              <Image
                key={mockupSrc}
                src={mockupSrc}
                alt="Learnify active learning mockup"
                width={800}
                height={800}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </Reveal>

        {/* Text */}
        <Reveal
          delay={120}
          className="order-2 flex flex-col lg:order-none lg:pl-4"
        >
          <span className="text-sm font-bold tracking-[0.2em] text-[#6b6b6b]">
            {feature.number}
          </span>
          <h2 className="mt-3 text-3xl font-bold leading-[1.15] tracking-tight text-[#1a1a1a] sm:text-4xl lg:text-5xl">
            {feature.title}
          </h2>
          <div className="mt-5 h-0.5 w-12 bg-[#1a1a1a]" aria-hidden />
          <p className="mt-6 max-w-lg text-base leading-relaxed text-[#6b6b6b] sm:text-lg">
            {feature.description}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
