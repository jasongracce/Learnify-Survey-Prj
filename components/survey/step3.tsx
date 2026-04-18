"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n";
import { Q8_OPTIONS, Q9_OPTIONS, type FormState } from "./types";

type Props = {
  form: FormState;
  setForm: (updater: (prev: FormState) => FormState) => void;
};

export default function Step3({ form, setForm }: Props) {
  const { t } = useLanguage();
  const s = t.surveyPage.step3;

  const toggleBlocker = (key: (typeof Q9_OPTIONS)[number]) => {
    setForm((prev) => {
      const has = prev.q9_blockers.includes(key);
      return {
        ...prev,
        q9_blockers: has
          ? prev.q9_blockers.filter((k) => k !== key)
          : [...prev.q9_blockers, key],
      };
    });
  };

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <span className="text-sm font-bold tracking-[0.2em] text-[#6b6b6b]">
          {s.eyebrow}
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl">
          {s.headline}
        </h1>
      </header>

      {/* Learnify blurb + mockup */}
      <div className="flex flex-col gap-5 rounded-2xl border border-black/5 bg-white p-6">
        <p className="text-base leading-relaxed text-[#6b6b6b]">{s.blurb}</p>
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#ececea]">
          <Image
            src="/personalized-mockup.png"
            alt="Learnify app preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>
      </div>

      {/* Q7 — 1-5 scale, REQUIRED */}
      <div className="flex flex-col gap-3">
        <span className="text-base font-medium text-[#1a1a1a]">
          {s.q7.label} <span className="text-[#c13b3b]">*</span>
        </span>
        <div className="flex items-center gap-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() =>
                setForm((prev) => ({ ...prev, q7_try_likelihood: n }))
              }
              className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-medium transition-all ${
                form.q7_try_likelihood === n
                  ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                  : "border-black/15 bg-white text-[#6b6b6b] hover:border-[#1a1a1a]"
              }`}
              aria-label={`${n}`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-[#9a9a97]">
          <span>1 · {s.q7.minLabel}</span>
          <span>5 · {s.q7.maxLabel}</span>
        </div>
      </div>

      {/* Q8 — radio with Other, REQUIRED */}
      <div className="flex flex-col gap-3">
        <span className="text-base font-medium text-[#1a1a1a]">
          {s.q8.label} <span className="text-[#c13b3b]">*</span>
        </span>
        <div className="flex flex-col gap-2">
          {Q8_OPTIONS.map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 text-sm text-[#6b6b6b]"
            >
              <input
                type="radio"
                name="q8"
                value={key}
                checked={form.q8_top_feature === key}
                onChange={() =>
                  setForm((prev) => ({ ...prev, q8_top_feature: key }))
                }
                className="h-4 w-4 accent-[#1a1a1a]"
              />
              <span>{s.q8.options[key]}</span>
            </label>
          ))}
          {form.q8_top_feature === "other" && (
            <input
              type="text"
              maxLength={200}
              value={form.q8_other}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, q8_other: e.target.value }))
              }
              placeholder={s.q8.otherPlaceholder}
              className="ml-7 mt-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a]"
            />
          )}
        </div>
      </div>

      {/* Q9 — multi-select checkboxes with Other, optional */}
      <div className="flex flex-col gap-3">
        <span className="text-base font-medium text-[#1a1a1a]">
          {s.q9.label}
        </span>
        <div className="flex flex-col gap-2">
          {Q9_OPTIONS.map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 text-sm text-[#6b6b6b]"
            >
              <input
                type="checkbox"
                checked={form.q9_blockers.includes(key)}
                onChange={() => toggleBlocker(key)}
                className="h-4 w-4 accent-[#1a1a1a]"
              />
              <span>{s.q9.options[key]}</span>
            </label>
          ))}
          {form.q9_blockers.includes("other") && (
            <input
              type="text"
              maxLength={200}
              value={form.q9_other}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, q9_other: e.target.value }))
              }
              placeholder={s.q9.otherPlaceholder}
              className="ml-7 mt-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a]"
            />
          )}
        </div>
      </div>

      {/* Q10 — textarea, optional */}
      <div className="flex flex-col gap-2">
        <label htmlFor="q10" className="text-base font-medium text-[#1a1a1a]">
          {s.q10.label}
        </label>
        <textarea
          id="q10"
          rows={4}
          maxLength={1000}
          value={form.q10_extra}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, q10_extra: e.target.value }))
          }
          placeholder={s.q10.placeholder}
          className="resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-base text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a]"
        />
      </div>
    </div>
  );
}
