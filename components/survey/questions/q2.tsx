"use client";

import { useLanguage } from "@/lib/i18n";
import { Q2_OPTIONS, type FormState } from "../types";

type Props = {
  form: FormState;
  setForm: (updater: (prev: FormState) => FormState) => void;
};

export default function Q2({ form, setForm }: Props) {
  const { t } = useLanguage();
  const q = t.surveyPage.step1.q2;

  return (
    <div className="flex flex-col gap-6">
      <span className="text-2xl font-semibold tracking-tight text-[#1a1a1a] md:text-3xl">
        {q.label}
      </span>
      <div className="flex flex-col gap-3">
        {Q2_OPTIONS.map((key) => (
          <label
            key={key}
            className="flex cursor-pointer items-center gap-3 text-base text-[#6b6b6b]"
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
            <span>{q.options[key]}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
