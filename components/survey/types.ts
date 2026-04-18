// Stable option keys — these are what persist to the DB.
// Labels are pulled from i18n at render time.

export const Q2_OPTIONS = [
  "daily",
  "severalTimesWeek",
  "weekly",
  "rarely",
  "never",
] as const;
export type Q2Option = (typeof Q2_OPTIONS)[number];

export const Q3_OPTIONS = [
  "homework",
  "examPrep",
  "newTopics",
  "language",
  "curiosity",
  "other",
] as const;
export type Q3Option = (typeof Q3_OPTIONS)[number];

export const Q4_OPTIONS = [
  "curriculum",
  "ads",
  "expensive",
  "lowQuality",
  "boring",
  "noPersonalization",
  "hardInThai",
  "other",
] as const;
export type Q4Option = (typeof Q4_OPTIONS)[number];

export const Q8_OPTIONS = [
  "lumi",
  "activeLearning",
  "thaiCurriculum",
  "personalized",
  "stats",
  "none",
  "other",
] as const;
export type Q8Option = (typeof Q8_OPTIONS)[number];

export const Q9_OPTIONS = [
  "price",
  "parents",
  "alreadyHave",
  "dontTrustAi",
  "noDevice",
  "nothing",
  "other",
] as const;
export type Q9Option = (typeof Q9_OPTIONS)[number];

export type FormState = {
  q1_tools_used: string;
  q2_frequency: Q2Option | "";
  q3_use_cases: Q3Option[];
  q3_other: string;
  q4_frustration: Q4Option | "";
  q4_other: string;
  q5_curriculum_fit: number | null;
  q6_wish: string;
  q7_try_likelihood: number | null;
  q8_top_feature: Q8Option | "";
  q8_other: string;
  q9_blockers: Q9Option[];
  q9_other: string;
  q10_extra: string;
};

export const INITIAL_FORM: FormState = {
  q1_tools_used: "",
  q2_frequency: "",
  q3_use_cases: [],
  q3_other: "",
  q4_frustration: "",
  q4_other: "",
  q5_curriculum_fit: null,
  q6_wish: "",
  q7_try_likelihood: null,
  q8_top_feature: "",
  q8_other: "",
  q9_blockers: [],
  q9_other: "",
  q10_extra: "",
};

export function isStep1Valid(form: FormState): boolean {
  return form.q1_tools_used.trim().length > 0;
}

export function isStep2Valid(_form: FormState): boolean {
  return true; // no required fields on step 2
}

export function isStep3Valid(form: FormState): boolean {
  return form.q7_try_likelihood !== null && form.q8_top_feature !== "";
}
