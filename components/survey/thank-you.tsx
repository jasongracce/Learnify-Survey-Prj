"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { getSupabase } from "@/lib/supabase";

type Props = {
  responseId: string | null;
  name: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Stage = "capture" | "success" | "skipped";

export default function ThankYou({ responseId, name }: Props) {
  const { t } = useLanguage();
  const ty = t.surveyPage.thankYou;
  const err = t.surveyPage.errors;

  const heading = ty.heading.replace("{name}", name);

  const [stage, setStage] = useState<Stage>("capture");
  const [email, setEmail] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleJoin = async () => {
    setInlineError(null);
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setInlineError(err.emailInvalid);
      return;
    }
    setIsSaving(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("beta_signups")
        .insert({ email: trimmed, response_id: responseId });
      if (error) {
        // Postgres unique violation code is 23505
        if (error.code === "23505") {
          setInlineError(err.emailDuplicate);
        } else {
          setInlineError(err.emailFailed);
        }
        setIsSaving(false);
        return;
      }
      setStage("success");
    } catch {
      setInlineError(err.emailFailed);
      setIsSaving(false);
    }
  };

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

      {stage === "capture" && (
        <>
          <p className="mt-6 max-w-md text-base text-[#6b6b6b]">
            {ty.subheading}
          </p>
          <div className="mt-6 flex w-full max-w-sm flex-col gap-3">
            <label htmlFor="email" className="sr-only">
              {ty.emailLabel}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={ty.emailPlaceholder}
              disabled={isSaving}
              className="rounded-xl border border-black/10 bg-white px-4 py-3 text-base text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a] disabled:opacity-60"
            />
            {inlineError && (
              <p className="text-sm text-[#c13b3b]">{inlineError}</p>
            )}
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleJoin}
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-full bg-[#1a1a1a] px-6 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#2a2a2a] disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {ty.waitlistCta}
              </button>
              <button
                type="button"
                onClick={() => setStage("skipped")}
                disabled={isSaving}
                className="text-sm font-medium text-[#6b6b6b] transition-colors hover:text-[#1a1a1a] disabled:opacity-60"
              >
                {ty.skipCta}
              </button>
            </div>
          </div>
        </>
      )}

      {stage === "success" && (
        <>
          <h2 className="mt-6 text-xl font-semibold text-[#1a1a1a]">
            {ty.successHeading}
          </h2>
          <p className="mt-2 text-base text-[#6b6b6b]">{ty.successBody}</p>
          <Link
            href="/"
            className="mt-8 text-sm font-medium text-[#1a1a1a] underline-offset-4 hover:underline"
          >
            {ty.backToHome}
          </Link>
        </>
      )}

      {stage === "skipped" && (
        <>
          <p className="mt-6 text-base text-[#6b6b6b]">{ty.skippedBody}</p>
          <Link
            href="/"
            className="mt-8 text-sm font-medium text-[#1a1a1a] underline-offset-4 hover:underline"
          >
            {ty.backToHome}
          </Link>
        </>
      )}
    </div>
  );
}
