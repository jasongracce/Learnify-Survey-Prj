"use client";

import { useLanguage } from "@/lib/i18n";
import type { FormState } from "../types";

type Props = {
  form: FormState;
  setForm: (updater: (prev: FormState) => FormState) => void;
};

export default function Q1({ form, setForm }: Props) {
  const { t } = useLanguage();
  const q = t.surveyPage.step1.q1;

  return (
    <div className="flex flex-col gap-6">
      <label
        htmlFor="q1"
        className="text-2xl font-semibold tracking-tight text-[#1a1a1a] md:text-3xl"
      >
        {q.label} <span className="text-[#c13b3b]">*</span>
      </label>
      <input
        id="q1"
        type="text"
        autoFocus
        maxLength={200}
        value={form.q1_tools_used}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, q1_tools_used: e.target.value }))
        }
        placeholder={q.placeholder}
        className="w-full border-0 border-b border-black/20 bg-transparent px-0 py-2 text-base text-[#1a1a1a] outline-none transition-colors placeholder:text-black/30 focus:border-[#1a1a1a]"
      />
    </div>
  );
}
