"use client";

import { useLanguage } from "@/lib/i18n";
import { Q2_OPTIONS, Q3_OPTIONS, type FormState } from "./types";

type Props = {
  form: FormState;
  setForm: (updater: (prev: FormState) => FormState) => void;
};

export default function Step1({ form, setForm }: Props) {
  const { t } = useLanguage();
  const s = t.surveyPage.step1;

  const toggleUseCase = (key: (typeof Q3_OPTIONS)[number]) => {
    setForm((prev) => {
      const has = prev.q3_use_cases.includes(key);
      return {
        ...prev,
        q3_use_cases: has
          ? prev.q3_use_cases.filter((k) => k !== key)
          : [...prev.q3_use_cases, key],
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

      {/* Q1 — free text, required */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="q1"
          className="text-base font-medium text-[#1a1a1a]"
        >
          {s.q1.label} <span className="text-[#c13b3b]">*</span>
        </label>
        <input
          id="q1"
          type="text"
          maxLength={200}
          value={form.q1_tools_used}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, q1_tools_used: e.target.value }))
          }
          placeholder={s.q1.placeholder}
          className="rounded-xl border border-black/10 bg-white px-4 py-3 text-base text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a]"
        />
      </div>

      {/* Q2 — radio, optional */}
      <div className="flex flex-col gap-3">
        <span className="text-base font-medium text-[#1a1a1a]">
          {s.q2.label}
        </span>
        <div className="flex flex-col gap-2">
          {Q2_OPTIONS.map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 text-sm text-[#6b6b6b]"
            >
              <input
                type="radio"
                name="q2"
                value={key}
                checked={form.q2_frequency === key}
                onChange={() =>
                  setForm((prev) => ({ ...prev, q2_frequency: key }))
                }
                className="h-4 w-4 accent-[#1a1a1a]"
              />
              <span>{s.q2.options[key]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Q3 — multi-select checkboxes with Other, optional */}
      <div className="flex flex-col gap-3">
        <span className="text-base font-medium text-[#1a1a1a]">
          {s.q3.label}
        </span>
        <div className="flex flex-col gap-2">
          {Q3_OPTIONS.map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 text-sm text-[#6b6b6b]"
            >
              <input
                type="checkbox"
                checked={form.q3_use_cases.includes(key)}
                onChange={() => toggleUseCase(key)}
                className="h-4 w-4 accent-[#1a1a1a]"
              />
              <span>{s.q3.options[key]}</span>
            </label>
          ))}
          {form.q3_use_cases.includes("other") && (
            <input
              type="text"
              maxLength={200}
              value={form.q3_other}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, q3_other: e.target.value }))
              }
              placeholder={s.q3.otherPlaceholder}
              className="ml-7 mt-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a]"
            />
          )}
        </div>
      </div>
    </div>
  );
}
