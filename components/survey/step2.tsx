"use client";

import { useLanguage } from "@/lib/i18n";
import { Q4_OPTIONS, type FormState } from "./types";

type Props = {
  form: FormState;
  setForm: (updater: (prev: FormState) => FormState) => void;
};

export default function Step2({ form, setForm }: Props) {
  const { t } = useLanguage();
  const s = t.surveyPage.step2;

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

      {/* Q4 — radio with Other, optional */}
      <div className="flex flex-col gap-3">
        <span className="text-base font-medium text-[#1a1a1a]">
          {s.q4.label}
        </span>
        <div className="flex flex-col gap-2">
          {Q4_OPTIONS.map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 text-sm text-[#6b6b6b]"
            >
              <input
                type="radio"
                name="q4"
                value={key}
                checked={form.q4_frustration === key}
                onChange={() =>
                  setForm((prev) => ({ ...prev, q4_frustration: key }))
                }
                className="h-4 w-4 accent-[#1a1a1a]"
              />
              <span>{s.q4.options[key]}</span>
            </label>
          ))}
          {form.q4_frustration === "other" && (
            <input
              type="text"
              maxLength={200}
              value={form.q4_other}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, q4_other: e.target.value }))
              }
              placeholder={s.q4.otherPlaceholder}
              className="ml-7 mt-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a]"
            />
          )}
        </div>
      </div>

      {/* Q5 — 1-5 scale, optional */}
      <div className="flex flex-col gap-3">
        <span className="text-base font-medium text-[#1a1a1a]">
          {s.q5.label}
        </span>
        <div className="flex items-center gap-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() =>
                setForm((prev) => ({ ...prev, q5_curriculum_fit: n }))
              }
              className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-medium transition-all ${
                form.q5_curriculum_fit === n
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
          <span>1 · {s.q5.minLabel}</span>
          <span>5 · {s.q5.maxLabel}</span>
        </div>
      </div>

      {/* Q6 — textarea, optional */}
      <div className="flex flex-col gap-2">
        <label htmlFor="q6" className="text-base font-medium text-[#1a1a1a]">
          {s.q6.label}
        </label>
        <textarea
          id="q6"
          rows={4}
          maxLength={500}
          value={form.q6_wish}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, q6_wish: e.target.value }))
          }
          placeholder={s.q6.placeholder}
          className="resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-base text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a]"
        />
      </div>
    </div>
  );
}
