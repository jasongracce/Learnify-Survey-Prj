"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n";
import type { FormState } from "../types";

type Props = {
  form: FormState;
  setForm: (updater: (prev: FormState) => FormState) => void;
};

export default function Q7({ form, setForm }: Props) {
  const { t } = useLanguage();
  const s = t.surveyPage.step3;

  return (
    <div className="flex flex-col gap-8">
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

      <div className="flex flex-col gap-6">
        <span className="text-2xl font-semibold tracking-tight text-[#1a1a1a] md:text-3xl">
          {s.q7.label} <span className="text-[#c13b3b]">*</span>
        </span>
        <div className="flex flex-col gap-2">
          <div className="grid w-full grid-cols-10 gap-1.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, q7_try_likelihood: n }))
                }
                className={`flex aspect-square items-center justify-center rounded-full border text-xs font-medium transition-all md:text-sm ${
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
            <span>10 · {s.q7.maxLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
