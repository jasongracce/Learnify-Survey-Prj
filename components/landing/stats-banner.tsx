"use client";

import { useLanguage } from "@/lib/i18n";

export default function StatsBanner() {
  const { t } = useLanguage();

  const pillars = [
    { num: "01.", label: t.pillars.active },
    { num: "02.", label: t.pillars.localised },
    { num: "03.", label: t.pillars.personalized },
    { num: "04.", label: t.pillars.ai },
  ];

  return (
    <section className="w-full bg-[#1a1a1a]">
      <div className="mx-auto max-w-7xl px-6 py-10 md:py-12">
        <div className="grid grid-cols-2 gap-y-8 md:grid-cols-4 md:gap-y-0">
          {pillars.map((pillar, i) => {
            const mobileBorder = i % 2 === 1 ? "border-l border-white/15" : "";
            const desktopBorder =
              i > 0 ? "md:border-l md:border-white/15" : "md:border-l-0";
            return (
              <div
                key={pillar.label}
                className={`flex items-center justify-center gap-3 md:gap-4 ${mobileBorder} ${desktopBorder}`}
              >
                <span className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {pillar.num}
                </span>
                <span className="max-w-[9rem] text-sm font-medium leading-tight text-white/70 sm:text-base">
                  {pillar.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
