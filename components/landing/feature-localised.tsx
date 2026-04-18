"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { GlobeWithThailandPin } from "@/components/ui/cobe-globe-thailand-pin";

export default function FeatureLocalised() {
  const { t } = useLanguage();
  const feature = t.features.localised;
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center start"],
  });

  const textY = useTransform(scrollYProgress, [0, 0.5], [40, 0]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const globeScale = useTransform(scrollYProgress, [0.1, 0.7], [0.85, 1]);
  const globeOpacity = useTransform(scrollYProgress, [0.1, 0.7], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#f9f9f7] py-24 md:py-32"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="flex flex-col items-center"
        >
          <span className="text-sm font-bold tracking-[0.2em] text-[#6b6b6b]">
            {feature.number}
          </span>
          <h2 className="mt-3 text-3xl font-bold leading-[1.15] tracking-tight text-[#1a1a1a] sm:text-4xl lg:text-5xl">
            {feature.title}
          </h2>
          <div className="mt-5 h-0.5 w-12 bg-[#1a1a1a]" aria-hidden />
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#6b6b6b] sm:text-lg">
            {feature.description}
          </p>
        </motion.div>

        <motion.div
          style={{ scale: globeScale, opacity: globeOpacity }}
          className="mt-12 w-full max-w-lg"
        >
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div
                className="absolute inset-6 rounded-full bg-[#e8f4fd] opacity-60 blur-3xl"
                aria-hidden
              />
            </div>
            <GlobeWithThailandPin />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
