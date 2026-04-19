"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

type Props = {
  responseId: string | null;
  name: string;
};

export default function ThankYou({ responseId: _responseId, name }: Props) {
  const { t } = useLanguage();
  const ty = t.surveyPage.thankYou;

  const heading = ty.heading.replace("{name}", name);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center text-center">
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="8 12 11 15 16 9" />
      </svg>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl">
        {heading}
      </h1>
      <div className="mt-5 h-0.5 w-12 bg-[#1a1a1a]" aria-hidden />

      <p className="mt-6 max-w-md text-base text-[#6b6b6b]">{ty.body}</p>

      <Link
        href="/"
        className="mt-8 text-sm font-medium text-[#1a1a1a] underline-offset-4 hover:underline"
      >
        {ty.backToHome}
      </Link>
    </div>
  );
}
