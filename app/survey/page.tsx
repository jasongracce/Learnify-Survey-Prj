"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/landing/header";
import Nav from "@/components/survey/nav";
import Progress from "@/components/survey/progress";
import Welcome from "@/components/survey/welcome";
import Q1 from "@/components/survey/questions/q1";
import Q2 from "@/components/survey/questions/q2";
import Q3 from "@/components/survey/questions/q3";
import Q4 from "@/components/survey/questions/q4";
import Q5 from "@/components/survey/questions/q5";
import Q6 from "@/components/survey/questions/q6";
import Q7 from "@/components/survey/questions/q7";
import Q8 from "@/components/survey/questions/q8";
import Q9 from "@/components/survey/questions/q9";
import Q10 from "@/components/survey/questions/q10";
import ThankYou from "@/components/survey/thank-you";
import {
  INITIAL_FORM,
  TOTAL_QUESTIONS,
  type FormState,
  canAdvance,
} from "@/components/survey/types";
import { useLanguage } from "@/lib/i18n";
import { getSupabase } from "@/lib/supabase";

const THANK_YOU_STEP = TOTAL_QUESTIONS + 1;

export default function SurveyPage() {
  const { t, language } = useLanguage();
  const sp = t.surveyPage;

  const [step, setStep] = useState<number>(0);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [responseId, setResponseId] = useState<string | null>(null);

  const isQuestion = step >= 1 && step <= TOTAL_QUESTIONS;
  const isLastQuestion = step === TOTAL_QUESTIONS;
  const canProceed = isQuestion && canAdvance(step, form);

  const goNext = () => {
    if (step < TOTAL_QUESTIONS) setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step > 1 && step <= TOTAL_QUESTIONS) setStep((s) => s - 1);
  };

  const leaveWelcome = () => setStep(1);

  const submit = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("survey_responses")
        .insert({
          language,
          respondent_name: form.respondent_name.trim(),
          q1_tools_used: form.q1_tools_used.trim(),
          q2_frequency: form.q2_frequency || null,
          q3_use_cases:
            form.q3_use_cases.length > 0 ? form.q3_use_cases : null,
          q3_other: form.q3_other.trim() || null,
          q4_frustrations:
            form.q4_frustrations.length > 0 ? form.q4_frustrations : null,
          q4_other: form.q4_other.trim() || null,
          q5_curriculum_fit: form.q5_curriculum_fit,
          q6_wish: form.q6_wish.trim() || null,
          q7_try_likelihood: form.q7_try_likelihood,
          q8_top_feature: form.q8_top_feature,
          q8_other: form.q8_other.trim() || null,
          q9_blockers: form.q9_blockers.length > 0 ? form.q9_blockers : null,
          q9_other: form.q9_other.trim() || null,
          q10_extra: form.q10_extra.trim() || null,
        })
        .select("id")
        .single();
      if (error || !data) {
        setSubmitError(sp.errors.submitFailed);
        setIsSubmitting(false);
        return;
      }

      const newResponseId = data.id as string;

      const { error: betaError } = await supabase
        .from("beta_signups")
        .insert({ email: form.email.trim(), response_id: newResponseId });
      if (betaError && betaError.code !== "23505") {
        console.error("beta_signups insert failed:", betaError);
      }

      setResponseId(newResponseId);
      setIsSubmitting(false);
      setStep(THANK_YOU_STEP);
    } catch {
      setSubmitError(sp.errors.submitFailed);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f7]">
      <Header simplified />
      <main className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Welcome
                form={form}
                setForm={setForm}
                onContinue={leaveWelcome}
              />
            </motion.div>
          )}

          {isQuestion && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Progress
                current={step}
                total={TOTAL_QUESTIONS}
                stepLabelTemplate={sp.progress.stepLabel}
              />

              <div className="mt-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`q${step}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {step === 1 && <Q1 form={form} setForm={setForm} />}
                    {step === 2 && <Q2 form={form} setForm={setForm} />}
                    {step === 3 && <Q3 form={form} setForm={setForm} />}
                    {step === 4 && <Q4 form={form} setForm={setForm} />}
                    {step === 5 && <Q5 form={form} setForm={setForm} />}
                    {step === 6 && <Q6 form={form} setForm={setForm} />}
                    {step === 7 && <Q7 form={form} setForm={setForm} />}
                    {step === 8 && <Q8 form={form} setForm={setForm} />}
                    {step === 9 && <Q9 form={form} setForm={setForm} />}
                    {step === 10 && <Q10 form={form} setForm={setForm} />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {isLastQuestion && submitError && (
                <p className="mt-6 text-sm text-[#c13b3b]">{submitError}</p>
              )}

              <Nav
                onBack={step > 1 ? goBack : undefined}
                onNext={isLastQuestion ? submit : goNext}
                backLabel={sp.nav.back}
                nextLabel={
                  isLastQuestion
                    ? isSubmitting
                      ? sp.nav.submitting
                      : sp.nav.submit
                    : sp.nav.next
                }
                nextDisabled={!canProceed}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          )}

          {step === THANK_YOU_STEP && (
            <motion.div
              key="thank-you"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <ThankYou
                responseId={responseId}
                name={form.respondent_name.trim()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
