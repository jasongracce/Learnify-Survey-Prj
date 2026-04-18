"use client";

import { useLanguage, type Translations } from "@/lib/i18n";

type CardKey = keyof Translations["cards"];

type CardStyle = {
  key: CardKey;
  side: "left" | "right";
  bg: string;
  labelBg: string;
  labelText: string;
  progressColor: string;
  progressWidth: string;
  rotation: string;
  desktopClass: string;
};

const cardStyles: CardStyle[] = [
  {
    key: "smartStudy",
    side: "left",
    bg: "bg-[#e8f4fd]",
    labelBg: "bg-[#cce7f9]",
    labelText: "text-[#2a7ab5]",
    progressColor: "bg-[#7ec4f0]",
    progressWidth: "w-3/5",
    rotation: "-rotate-3",
    desktopClass: "top-[8%] left-[2%] xl:left-[4%]",
  },
  {
    key: "multiSubject",
    side: "left",
    bg: "bg-[#eaf7ec]",
    labelBg: "bg-[#c8eacc]",
    labelText: "text-[#3a8a44]",
    progressColor: "bg-[#7dd68a]",
    progressWidth: "w-2/5",
    rotation: "rotate-2",
    desktopClass: "bottom-[8%] left-[4%] xl:left-[6%]",
  },
  {
    key: "liveSupport",
    side: "right",
    bg: "bg-[#fef6e8]",
    labelBg: "bg-[#fce8c3]",
    labelText: "text-[#b57d2a]",
    progressColor: "bg-[#f0b86a]",
    progressWidth: "w-1/2",
    rotation: "rotate-3",
    desktopClass: "top-[8%] right-[2%] xl:right-[4%]",
  },
  {
    key: "studySystem",
    side: "right",
    bg: "bg-[#f2edf9]",
    labelBg: "bg-[#ddd2f0]",
    labelText: "text-[#7b5ea7]",
    progressColor: "bg-[#b49ad8]",
    progressWidth: "w-3/4",
    rotation: "-rotate-2",
    desktopClass: "bottom-[8%] right-[4%] xl:right-[6%]",
  },
];

function Card({
  label,
  title,
  description,
  labelBg,
  labelText,
  progressColor,
  progressWidth,
}: {
  label: string;
  title: string;
  description: string;
  labelBg: string;
  labelText: string;
  progressColor: string;
  progressWidth: string;
}) {
  return (
    <>
      <span
        className={`${labelBg} ${labelText} inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider`}
      >
        {label}
      </span>
      <h3 className="mt-3 text-sm font-bold text-[#1a1a1a]">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-[#888]">
        {description}
      </p>
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-black/5">
        <div
          className={`${progressColor} ${progressWidth} h-full rounded-full`}
        />
      </div>
    </>
  );
}

export default function FloatingCards({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <>
      {/* Desktop/Tablet: hero with floating absolute cards */}
      <section className="relative mx-auto w-full max-w-7xl px-6 py-20 md:py-24 lg:min-h-[calc(100vh-4rem)] lg:flex lg:items-center lg:justify-center lg:py-16">
        {/* Dot grid background */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: "radial-gradient(circle, #d1d1d1 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 40%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 40%, transparent 100%)",
          }}
        />
        {/* Floating cards — visible on lg+ */}
        {cardStyles.map((card) => {
          const content = t.cards[card.key];
          return (
            <div
              key={card.key}
              className={`
                ${card.bg} ${card.rotation} ${card.desktopClass}
                absolute hidden w-48 rounded-2xl p-4 shadow-sm
                transition-all duration-300 hover:shadow-md hover:-translate-y-1
                lg:block xl:w-52 xl:p-5
              `}
            >
              <Card
                label={content.label}
                title={content.title}
                description={content.description}
                labelBg={card.labelBg}
                labelText={card.labelText}
                progressColor={card.progressColor}
                progressWidth={card.progressWidth}
              />
            </div>
          );
        })}

        {/* Hero content centered */}
        <div className="relative z-10 w-full">{children}</div>
      </section>

      {/* Mobile/Tablet: cards in a grid below hero */}
      <section className="px-6 pb-16 lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-2 gap-3 sm:gap-4">
          {cardStyles.map((card) => {
            const content = t.cards[card.key];
            return (
              <div
                key={card.key}
                className={`${card.bg} rounded-2xl p-4 shadow-sm sm:p-5`}
              >
                <Card
                  label={content.label}
                  title={content.title}
                  description={content.description}
                  labelBg={card.labelBg}
                  labelText={card.labelText}
                  progressColor={card.progressColor}
                  progressWidth={card.progressWidth}
                />
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
