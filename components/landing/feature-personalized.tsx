"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

export default function FeaturePersonalized() {
  const { t, language } = useLanguage();
  const feature = t.features.personalized;
  const mockupSrc =
    language === "th"
      ? "/personalized-mockup-th.png"
      : "/personalized-mockup.png";
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center start"],
  });

  const imageX = useTransform(scrollYProgress, [0, 0.6], [-60, 0]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const textX = useTransform(scrollYProgress, [0.1, 0.7], [50, 0]);
  const textOpacity = useTransform(scrollYProgress, [0.1, 0.6], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#f9f9f7] py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl bg-[#1a1a1a] p-8 md:p-12 lg:p-16">
          <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Phone mockup */}
            <motion.div
              style={{ x: imageX, opacity: imageOpacity }}
              className="flex justify-center lg:justify-start"
            >
              <div
                className="relative w-full max-w-md overflow-hidden rounded-3xl ring-1 ring-white/10"
                style={{
                  transform: "rotate(-4deg)",
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
            </motion.div>

            {/* Text */}
            <motion.div
              style={{ x: textX, opacity: textOpacity }}
              className="flex flex-col"
            >
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
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
