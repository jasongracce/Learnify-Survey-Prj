"use client";

import { useLanguage } from "@/lib/i18n";
import Reveal from "./reveal";

export default function Survey() {
  const { t } = useLanguage();
  const s = t.survey;

  return (
    <section id="survey" className="w-full bg-[#f9f9f7] py-16 md:py-28">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <Reveal className="flex flex-col items-center">
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
        </Reveal>

        <Reveal delay={150} className="mt-10">
          <a
            href="/survey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-[#1a1a1a] px-8 py-4 text-base font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#2a2a2a]"
          >
            {s.cta}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
