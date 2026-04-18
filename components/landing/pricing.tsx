"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

function Check({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Cross({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

type FeatureRow = { label: string; included: boolean };

type Tier = {
  badge: string;
  price: string;
  tagline: string;
  features: FeatureRow[];
  highlighted: boolean;
};

function PricingCard({
  tier,
  billingSuffix,
  cta,
  delay,
  scrollProgress,
}: {
  tier: Tier;
  billingSuffix: string;
  cta: string;
  delay: number;
  scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const y = useTransform(
    scrollProgress,
    [0 + delay, 0.5 + delay],
    [40, 0],
  );
  const opacity = useTransform(
    scrollProgress,
    [0 + delay, 0.5 + delay],
    [0, 1],
  );

  const topPanelClass = tier.highlighted
    ? "bg-[#1a1a1a] text-white"
    : "bg-[#f1f1f0] text-[#1a1a1a]";

  const badgeClass = tier.highlighted
    ? "bg-white text-[#1a1a1a]"
    : "bg-white text-[#1a1a1a]";

  const priceSuffixClass = tier.highlighted ? "text-white/70" : "text-[#6b6b6b]";

  return (
    <motion.div
      style={{ y, opacity }}
      className="flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm"
    >
      {/* Top panel */}
      <div className={`px-6 pt-6 pb-8 ${topPanelClass}`}>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${badgeClass}`}
        >
          {tier.badge}
        </span>
        <div className="mt-6 flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
          <span className={`text-sm font-medium ${priceSuffixClass}`}>
            {billingSuffix}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-6 pt-6 pb-6">
        <p className="text-sm text-[#6b6b6b]">{tier.tagline}</p>

        <button
          type="button"
          disabled
          aria-disabled
          className="mt-5 w-full rounded-full bg-[#1a1a1a] px-4 py-3 text-sm font-medium text-white opacity-80 cursor-not-allowed"
        >
          {cta}
        </button>

        <div className="mt-6 h-px w-full bg-black/5" aria-hidden />

        <ul className="mt-6 flex flex-col gap-3">
          {tier.features.map((f) => (
            <li key={f.label} className="flex items-center gap-3 text-sm">
              {f.included ? (
                <Check className="shrink-0 text-[#1a1a1a]" />
              ) : (
                <Cross className="shrink-0 text-[#c9c9c7]" />
              )}
              <span
                className={f.included ? "text-[#1a1a1a]" : "text-[#9a9a97]"}
              >
                {f.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function Pricing() {
  const { t } = useLanguage();
  const p = t.pricing;
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center start"],
  });

  const headingY = useTransform(scrollYProgress, [0, 0.4], [40, 0]);
  const headingOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  const tiers: Tier[] = [
    {
      badge: p.tiers.free.badge,
      price: p.tiers.free.price,
      tagline: p.tiers.free.tagline,
      highlighted: false,
      features: [
        { label: p.features.activeLearning, included: true },
        { label: p.features.unlimitedLearning, included: false },
        { label: p.features.unlimitedLumi, included: false },
        { label: p.features.noAds, included: false },
        { label: p.features.personalizedPaths, included: false },
      ],
    },
    {
      badge: p.tiers.pro.badge,
      price: p.tiers.pro.price,
      tagline: p.tiers.pro.tagline,
      highlighted: true,
      features: [
        { label: p.features.activeLearning, included: true },
        { label: p.features.unlimitedLearning, included: true },
        { label: p.features.unlimitedLumi, included: true },
        { label: p.features.noAds, included: true },
        { label: p.features.personalizedPaths, included: true },
      ],
    },
    {
      badge: p.tiers.ultra.badge,
      price: p.tiers.ultra.price,
      tagline: p.tiers.ultra.tagline,
      highlighted: false,
      features: [
        { label: p.features.everythingInPro, included: true },
        { label: p.features.advancedAnalytics, included: true },
        { label: p.features.earlyAccess, included: true },
      ],
    },
  ];

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="w-full bg-[#f9f9f7] py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          style={{ y: headingY, opacity: headingOpacity }}
          className="flex flex-col items-center text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-[#1a1a1a] md:text-5xl">
            {p.title}
          </h2>
          <p className="mt-3 text-base text-[#6b6b6b]">{p.subtitle}</p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {tiers.map((tier, i) => (
            <PricingCard
              key={tier.badge}
              tier={tier}
              billingSuffix={p.billingSuffix}
              cta={p.cta}
              delay={i * 0.08}
              scrollProgress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
