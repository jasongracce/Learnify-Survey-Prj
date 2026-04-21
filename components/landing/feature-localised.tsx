"use client";

import { useLanguage } from "@/lib/i18n";
import { GlobeWithThailandPin } from "@/components/ui/cobe-globe-thailand-pin";
import Reveal from "./reveal";
import { useVisibilityPause } from "@/lib/use-visibility-pause";
import { useIsDesktop } from "@/lib/use-is-desktop";

function StaticGlobe() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm select-none">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, #ffffff 0%, #f0f5fb 45%, #d6e3ef 75%, #b9c9d9 100%)",
          boxShadow: "inset -20px -30px 80px rgba(0,0,0,0.12)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.6) 0%, transparent 40%)",
        }}
        aria-hidden
      />
      {/* Thai flag pin marker, roughly centered */}
      <div
        className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-full"
        style={{ filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.22))" }}
        aria-hidden
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            boxShadow: "0 0 0 3px #ffffff",
            background: `linear-gradient(
              to bottom,
              #A51931 0%, #A51931 16.67%,
              #F4F5F8 16.67%, #F4F5F8 33.33%,
              #2D2A4A 33.33%, #2D2A4A 66.67%,
              #F4F5F8 66.67%, #F4F5F8 83.33%,
              #A51931 83.33%, #A51931 100%
            )`,
          }}
        />
        <div
          style={{
            width: 0,
            height: 0,
            margin: "2px auto 0",
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "7px solid #ffffff",
          }}
        />
      </div>
    </div>
  );
}

function DesktopGlobe() {
  const { ref, isVisible } = useVisibilityPause<HTMLDivElement>();
  return (
    <div ref={ref} className="w-full">
      <GlobeWithThailandPin speed={0.008} enabled={isVisible} />
    </div>
  );
}

export default function FeatureLocalised() {
  const { t } = useLanguage();
  const feature = t.features.localised;
  const isDesktop = useIsDesktop();

  return (
    <section className="relative w-full overflow-hidden bg-[#f9f9f7] py-16 md:py-28">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <Reveal className="flex flex-col items-center">
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
        </Reveal>

        <Reveal delay={150} className="mt-12 w-full max-w-lg">
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div
                className="absolute inset-6 rounded-full bg-[#e8f4fd] opacity-60 blur-3xl"
                aria-hidden
              />
            </div>
            {isDesktop ? <DesktopGlobe /> : <StaticGlobe />}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
