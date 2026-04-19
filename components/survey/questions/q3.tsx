"use client";

import { useLanguage } from "@/lib/i18n";
import { Q3_OPTIONS, type FormState } from "../types";

type Props = {
  form: FormState;
  setForm: (updater: (prev: FormState) => FormState) => void;
};

export default function Q3({ form, setForm }: Props) {
  const { t } = useLanguage();
  const q = t.surveyPage.step1.q3;

  const toggle = (key: (typeof Q3_OPTIONS)[number]) => {
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
    <div className="flex flex-col gap-6">
      <span className="text-2xl font-semibold tracking-tight text-[#1a1a1a] md:text-3xl">
        {q.label}
      </span>
      <div className="flex flex-col gap-3">
        {Q3_OPTIONS.map((key) => (
          <label
            key={key}
            className="flex cursor-pointer items-center gap-3 text-base text-[#6b6b6b]"
          >
            <input
              type="checkbox"
              checked={form.q3_use_cases.includes(key)}
              onChange={() => toggle(key)}
              className="h-4 w-4 accent-[#1a1a1a]"
            />
            <span>{q.options[key]}</span>
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
            placeholder={q.otherPlaceholder}
            className="ml-7 mt-1 border-0 border-b border-black/20 bg-transparent px-0 py-2 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-black/30 focus:border-[#1a1a1a]"
          />
        )}
      </div>
    </div>
  );
}
