"use client";

import { useRef, useState } from "react";
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
};

function PricingCard({
  tier,
  billingSuffix,
  cta,
  selected,
  onSelect,
  delay,
  scrollProgress,
}: {
  tier: Tier;
  billingSuffix: string;
  cta: string;
  selected: boolean;
  onSelect: () => void;
  delay: number;
  scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const entranceY = useTransform(
    scrollProgress,
    [0 + delay, 0.5 + delay],
    [40, 0],
  );
  const entranceOpacity = useTransform(
    scrollProgress,
    [0 + delay, 0.5 + delay],
    [0, 1],
  );

  const cardClass = selected
    ? "-translate-y-3 bg-[#1a1a1a] text-white border-black/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)]"
    : "translate-y-0 bg-[#ececea] text-[#6b6b6b] border-black/5 shadow-sm hover:-translate-y-1";

  const badgeClass = selected
    ? "bg-white text-[#1a1a1a]"
    : "bg-white/80 text-[#6b6b6b]";

  const priceClass = selected ? "text-white" : "text-[#6b6b6b]";
  const priceSuffixClass = selected ? "text-white/70" : "text-[#9a9a97]";
  const taglineClass = selected ? "text-white/70" : "text-[#9a9a97]";
  const dividerClass = selected ? "bg-white/15" : "bg-black/5";

  const ctaClass = selected
    ? "bg-white text-[#1a1a1a]"
    : "bg-[#1a1a1a]/80 text-white";

  return (
    <motion.div
      style={{ y: entranceY, opacity: entranceOpacity }}
      className="w-full"
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={`group flex w-full flex-col overflow-hidden rounded-3xl border text-left outline-none transition-all duration-500 ease-out focus-visible:ring-2 focus-visible:ring-[#1a1a1a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f9f9f7] ${cardClass}`}
      >
        {/* Top */}
        <div className="flex flex-col gap-6 px-6 pt-6 pb-2">
          <span
            className={`inline-flex self-start rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-colors duration-500 ${badgeClass}`}
          >
            {tier.badge}
          </span>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-4xl font-bold tracking-tight transition-colors duration-500 ${priceClass}`}
            >
              {tier.price}
            </span>
            <span
              className={`text-sm font-medium transition-colors duration-500 ${priceSuffixClass}`}
            >
              {billingSuffix}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col px-6 pt-4 pb-6">
          <p
            className={`text-sm transition-colors duration-500 ${taglineClass}`}
          >
            {tier.tagline}
          </p>

          <span
            aria-disabled
            className={`mt-5 block w-full cursor-not-allowed rounded-full px-4 py-3 text-center text-sm font-medium transition-colors duration-500 ${ctaClass}`}
          >
            {cta}
          </span>

          <div
            className={`mt-6 h-px w-full transition-colors duration-500 ${dividerClass}`}
            aria-hidden
          />

          <ul className="mt-6 flex flex-col gap-3">
            {tier.features.map((f) => {
              const iconClass = f.included
                ? selected
                  ? "text-white"
                  : "text-[#6b6b6b]"
                : selected
                  ? "text-white/40"
                  : "text-[#c9c9c7]";
              const labelClass = f.included
                ? selected
                  ? "text-white"
                  : "text-[#6b6b6b]"
                : selected
                  ? "text-white/50"
                  : "text-[#b8b8b6]";
              return (
                <li key={f.label} className="flex items-center gap-3 text-sm">
                  {f.included ? (
                    <Check
                      className={`shrink-0 transition-colors duration-500 ${iconClass}`}
                    />
                  ) : (
                    <Cross
                      className={`shrink-0 transition-colors duration-500 ${iconClass}`}
                    />
                  )}
                  <span
                    className={`transition-colors duration-500 ${labelClass}`}
                  >
                    {f.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </button>
    </motion.div>
  );
}

export default function Pricing() {
  const { t } = useLanguage();
  const p = t.pricing;
  const sectionRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

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
      features: [
        { label: p.features.activeLearning, included: true },
        { label: p.features.unlimitedLearning, included: false },
        { label: p.features.weeklyLumi, included: false },
        { label: p.features.noAds, included: false },
        { label: p.features.personalizedPaths, included: false },
      ],
    },
    {
      badge: p.tiers.pro.badge,
      price: p.tiers.pro.price,
      tagline: p.tiers.pro.tagline,
      features: [
        { label: p.features.activeLearning, included: true },
        { label: p.features.unlimitedLearning, included: true },
        { label: p.features.weeklyLumi, included: true },
        { label: p.features.noAds, included: true },
        { label: p.features.personalizedPaths, included: true },
      ],
    },
    {
      badge: p.tiers.ultra.badge,
      price: p.tiers.ultra.price,
      tagline: p.tiers.ultra.tagline,
      features: [
        { label: p.features.everythingInPro, included: true },
        { label: p.features.advancedAnalytics, included: true },
        { label: p.features.unlimitedLumi, included: true },
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

        <div className="mt-14 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {tiers.map((tier, i) => (
            <PricingCard
              key={tier.badge}
              tier={tier}
              billingSuffix={p.billingSuffix}
              cta={p.cta}
              selected={selectedIndex === i}
              onSelect={() => setSelectedIndex(i)}
              delay={i * 0.08}
              scrollProgress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
