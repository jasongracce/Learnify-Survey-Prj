"use client";

import { useLanguage } from "@/lib/i18n";
import type { FormState } from "../types";

type Props = {
  form: FormState;
  setForm: (updater: (prev: FormState) => FormState) => void;
};

export default function Q5({ form, setForm }: Props) {
  const { t } = useLanguage();
  const q = t.surveyPage.step2.q5;

  return (
    <div className="flex flex-col gap-6">
      <span className="text-2xl font-semibold tracking-tight text-[#1a1a1a] md:text-3xl">
        {q.label}
      </span>
      <div className="flex flex-col gap-2">
        <div className="grid w-full grid-cols-10 gap-1.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() =>
                setForm((prev) => ({ ...prev, q5_curriculum_fit: n }))
              }
              className={`flex aspect-square items-center justify-center rounded-full border text-xs font-medium transition-all md:text-sm ${
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
          <span>1 · {q.minLabel}</span>
          <span>10 · {q.maxLabel}</span>
        </div>
      </div>
    </div>
  );
}
