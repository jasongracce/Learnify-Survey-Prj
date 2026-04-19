"use client";

import { useLanguage } from "@/lib/i18n";
import type { FormState } from "../types";

type Props = {
  form: FormState;
  setForm: (updater: (prev: FormState) => FormState) => void;
};

export default function Q10({ form, setForm }: Props) {
  const { t } = useLanguage();
  const q = t.surveyPage.step3.q10;

  return (
    <div className="flex flex-col gap-6">
      <label
        htmlFor="q10"
        className="text-2xl font-semibold tracking-tight text-[#1a1a1a] md:text-3xl"
      >
        {q.label}
      </label>
      <textarea
        id="q10"
        rows={4}
        maxLength={1000}
        value={form.q10_extra}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, q10_extra: e.target.value }))
        }
        placeholder={q.placeholder}
        className="resize-none border-0 border-b border-black/20 bg-transparent px-0 py-2 text-base text-[#1a1a1a] outline-none transition-colors placeholder:text-black/30 focus:border-[#1a1a1a]"
      />
    </div>
  );
}
