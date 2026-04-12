"use client";

import { useState, useEffect } from "react";

function TextRotate({
  texts,
  rotationInterval = 2600,
  className = "",
}: {
  texts: string[];
  rotationInterval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (texts.length === 0) return;

    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, rotationInterval);

    return () => window.clearInterval(id);
  }, [texts, rotationInterval]);

  return <span className={className}>{texts[index] ?? ""}</span>;
}

export default function Hero() {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Pill badge */}
      <span className="animate-fade-in-up mb-6 inline-flex rounded-full border border-black/8 bg-white px-4 py-1.5 text-xs font-medium tracking-wide text-[#6b6b6b]">
        Smarter study starts here
      </span>

      {/* Headline */}
      <h1 className="animate-fade-in-up animation-delay-100 max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight text-[#1a1a1a] sm:text-5xl lg:text-6xl">
        Are you ready to{" "}
        <br />
        <span className="inline-block align-baseline text-black">
          <TextRotate
            texts={[
              "learn smarter?",
              "stay focused?",
              "ask better questions?",
              "study with clarity?",
            ]}
            rotationInterval={2600}
            className="inline-block leading-[1.1] pb-2"
          />
        </span>
      </h1>

      {/* Supporting text */}
      <p className="animate-fade-in-up animation-delay-200 mt-6 max-w-md text-base leading-relaxed text-[#888] sm:text-lg">
        Learnify helps students study with more focus, ask better questions, and
        build real understanding without the usual overwhelm.
      </p>

      {/* CTA Buttons */}
      <div className="animate-fade-in-up animation-delay-300 mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <a
          href="#survey"
          className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] px-7 py-3 text-sm font-medium text-white transition-all hover:scale-[1.03] hover:shadow-lg"
        >
          Answer Survey
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            className="ml-0.5"
          >
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
        <a
          href="#features"
          className="inline-flex items-center rounded-full border border-[#d4d4d4] bg-white px-7 py-3 text-sm font-medium text-[#1a1a1a] transition-all hover:border-[#1a1a1a] hover:shadow-sm"
        >
          See Features
        </a>
      </div>

      {/* Beta badge */}
      <span className="animate-fade-in-up animation-delay-400 mt-6 text-xs font-medium tracking-wide text-[#bbb] italic">
        Beta Test soon...
      </span>
    </div>
  );
}
