"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import type { FormState } from "./types";

type Phase = "greeting" | "form" | "thanks" | "letsStart";

type Props = {
  form: FormState;
  setForm: (updater: (prev: FormState) => FormState) => void;
  onContinue: () => void;
  canContinue: boolean;
};

export default function Welcome({
  form,
  setForm,
  onContinue,
  canContinue,
}: Props) {
  const { t } = useLanguage();
  const w = t.surveyPage.welcome;

  const [phase, setPhase] = useState<Phase>("greeting");

  const onContinueRef = useRef(onContinue);
  useEffect(() => {
    onContinueRef.current = onContinue;
  }, [onContinue]);

  useEffect(() => {
    if (phase === "greeting") {
      const id = window.setTimeout(() => setPhase("form"), 2500);
      return () => window.clearTimeout(id);
    }
    if (phase === "thanks") {
      const id = window.setTimeout(() => setPhase("letsStart"), 2500);
      return () => window.clearTimeout(id);
    }
    if (phase === "letsStart") {
      const id = window.setTimeout(() => onContinueRef.current(), 2000);
      return () => window.clearTimeout(id);
    }
  }, [phase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canContinue) setPhase("thanks");
  };

  const name = form.respondent_name.trim();
  const thanks = w.thanksMessage.replace("{name}", name);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <AnimatePresence mode="wait">
        {phase === "greeting" && (
          <motion.h1
            key="greeting"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center text-4xl font-bold tracking-tight text-[#1a1a1a] md:text-5xl"
          >
            <span className="block">{w.greetingPrefix}</span>
            <span className="block">{w.greetingTitle}</span>
          </motion.h1>
        )}

        {phase === "form" && (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex w-full max-w-md flex-col items-center gap-6"
          >
            <h1 className="text-4xl font-bold tracking-tight text-[#1a1a1a] md:text-5xl">
              {w.nameQuestion}
            </h1>
            <input
              type="text"
              autoFocus
              maxLength={100}
              value={form.respondent_name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  respondent_name: e.target.value,
                }))
              }
              placeholder={w.namePlaceholder}
              className="w-full border-0 border-b border-black/20 bg-transparent px-0 py-2 text-center text-lg text-[#1a1a1a] outline-none transition-colors placeholder:text-black/30 focus:border-[#1a1a1a]"
            />
            <button
              type="submit"
              disabled={!canContinue}
              className="inline-flex items-center justify-center rounded-full bg-[#1a1a1a] px-8 py-3 text-base font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              {w.getStarted}
            </button>
          </motion.form>
        )}

        {phase === "thanks" && (
          <motion.h1
            key="thanks"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl text-center text-3xl font-bold tracking-tight text-[#1a1a1a] md:text-4xl"
          >
            {thanks}
          </motion.h1>
        )}

        {phase === "letsStart" && (
          <motion.h1
            key="letsStart"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center text-4xl font-bold tracking-tight text-[#1a1a1a] md:text-5xl"
          >
            {w.letsGetStarted}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
}
