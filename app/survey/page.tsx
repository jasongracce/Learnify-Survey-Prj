"use client";

import { useState } from "react";
import Header from "@/components/landing/header";
import Nav from "@/components/survey/nav";
import Progress from "@/components/survey/progress";
import Step1 from "@/components/survey/step1";
import Step2 from "@/components/survey/step2";
import Step3 from "@/components/survey/step3";
import ThankYou from "@/components/survey/thank-you";
import {
  INITIAL_FORM,
  type FormState,
  isStep1Valid,
  isStep2Valid,
  isStep3Valid,
} from "@/components/survey/types";
import { useLanguage } from "@/lib/i18n";
import { getSupabase } from "@/lib/supabase";

type Step = 1 | 2 | 3 | 4;

export default function SurveyPage() {
  const { t, language } = useLanguage();
  const sp = t.surveyPage;

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [responseId, setResponseId] = useState<string | null>(null);

  const canProceed =
    (step === 1 && isStep1Valid(form)) ||
    (step === 2 && isStep2Valid(form)) ||
    (step === 3 && isStep3Valid(form));

  const goNext = () => {
    if (step < 3) {
      setStep((s) => (s + 1) as Step);
    }
  };

  const goBack = () => {
    if (step > 1 && step <= 3) {
      setStep((s) => (s - 1) as Step);
    }
  };

  const submit = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("survey_responses")
        .insert({
          language,
          q1_tools_used: form.q1_tools_used.trim(),
          q2_frequency: form.q2_frequency || null,
          q3_use_cases:
            form.q3_use_cases.length > 0 ? form.q3_use_cases : null,
          q3_other: form.q3_other.trim() || null,
          q4_frustration: form.q4_frustration || null,
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
      setResponseId(data.id as string);
      setIsSubmitting(false);
      setStep(4);
    } catch {
      setSubmitError(sp.errors.submitFailed);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f7]">
      <Header simplified />
      <main className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        {step < 4 ? (
          <>
            <Progress
              current={step}
              total={3}
              stepLabelTemplate={sp.progress.stepLabel}
            />

            <div className="mt-12">
              {step === 1 && <Step1 form={form} setForm={setForm} />}
              {step === 2 && <Step2 form={form} setForm={setForm} />}
              {step === 3 && <Step3 form={form} setForm={setForm} />}
            </div>

            {step === 3 && submitError && (
              <p className="mt-6 text-sm text-[#c13b3b]">{submitError}</p>
            )}

            <Nav
              onBack={step > 1 ? goBack : undefined}
              onNext={step === 3 ? submit : goNext}
              backLabel={sp.nav.back}
              nextLabel={
                step === 3
                  ? isSubmitting
                    ? sp.nav.submitting
                    : sp.nav.submit
                  : sp.nav.next
              }
              nextDisabled={!canProceed}
              isSubmitting={isSubmitting}
            />
          </>
        ) : (
          <ThankYou responseId={responseId} />
        )}
      </main>
    </div>
  );
}
