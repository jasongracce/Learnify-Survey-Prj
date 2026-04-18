"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

export default function Survey() {
  const { t } = useLanguage();
  const s = t.survey;
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center start"],
  });

  const textY = useTransform(scrollYProgress, [0, 0.5], [40, 0]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.1, 0.6], [30, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0.1, 0.6], [0, 1]);

  return (
    <section
      id="survey"
      ref={sectionRef}
      className="w-full bg-[#f9f9f7] py-24 md:py-32"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="flex flex-col items-center"
        >
          <span className="text-sm font-bold tracking-[0.2em] text-[#6b6b6b]">
            {s.eyebrow}
          </span>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#1a1a1a] md:text-5xl">
            {s.headline}
          </h2>
          <div className="mt-5 h-0.5 w-12 bg-[#1a1a1a]" aria-hidden />
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#6b6b6b] md:text-lg">
            {s.subtitle}
          </p>
        </motion.div>

        <motion.a
          // TODO: replace with real survey URL once the survey app is live
          href="#"
          style={{ y: ctaY, opacity: ctaOpacity }}
          className="mt-10 inline-flex items-center justify-center rounded-full bg-[#1a1a1a] px-8 py-4 text-base font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#2a2a2a]"
        >
          {s.cta}
        </motion.a>
      </div>
    </section>
  );
}
