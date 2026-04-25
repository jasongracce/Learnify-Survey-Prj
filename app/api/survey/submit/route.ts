import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { sendSurveyConfirmation } from "@/lib/email";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MINUTES = 60;

type Payload = {
  language: "en" | "th";
  email: string;
  respondent_name: string;
  q1_tools_used: string;
  q2_frequency: string;
  q3_use_cases: string[];
  q3_other: string;
  q4_frustrations: string[];
  q4_other: string;
  q5_curriculum_fit: number | null;
  q6_wish: string;
  q7_try_likelihood: number | null;
  q8_top_feature: string;
  q8_other: string;
  q9_blockers: string[];
  q9_other: string;
  q10_extra: string;
};

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function validate(body: unknown): body is Payload {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;

  if (b.language !== "en" && b.language !== "th") return false;
  if (typeof b.email !== "string" || !EMAIL_RE.test(b.email.trim())) return false;
  if (typeof b.respondent_name !== "string" || b.respondent_name.trim() === "")
    return false;
  if (typeof b.q1_tools_used !== "string" || b.q1_tools_used.trim() === "")
    return false;
  if (typeof b.q2_frequency !== "string") return false;
  if (!isStringArray(b.q3_use_cases)) return false;
  if (typeof b.q3_other !== "string") return false;
  if (!isStringArray(b.q4_frustrations)) return false;
  if (typeof b.q4_other !== "string") return false;
  if (
    b.q5_curriculum_fit !== null &&
    (typeof b.q5_curriculum_fit !== "number" ||
      !Number.isInteger(b.q5_curriculum_fit) ||
      b.q5_curriculum_fit < 1 ||
      b.q5_curriculum_fit > 10)
  )
    return false;
  if (typeof b.q6_wish !== "string") return false;
  if (
    typeof b.q7_try_likelihood !== "number" ||
    !Number.isInteger(b.q7_try_likelihood) ||
    b.q7_try_likelihood < 1 ||
    b.q7_try_likelihood > 10
  )
    return false;
  if (typeof b.q8_top_feature !== "string" || b.q8_top_feature === "")
    return false;
  if (typeof b.q8_other !== "string") return false;
  if (!isStringArray(b.q9_blockers)) return false;
  if (typeof b.q9_other !== "string") return false;
  if (typeof b.q10_extra !== "string") return false;
  return true;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!validate(body)) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const p: Payload = body;
  const ip = getClientIp(req);

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (e) {
    console.error("supabase admin init failed:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  const since = new Date(
    Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  ).toISOString();

  const { count, error: countError } = await supabase
    .from("submission_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", since);

  if (countError) {
    console.error("rate limit count failed:", countError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  if ((count ?? 0) >= RATE_LIMIT_MAX) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { error: attemptError } = await supabase
    .from("submission_attempts")
    .insert({ ip });
  if (attemptError) {
    console.error("attempt insert failed:", attemptError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  const { data: responseRow, error: responseError } = await supabase
    .from("survey_responses")
    .insert({
      language: p.language,
      respondent_name: p.respondent_name.trim(),
      q1_tools_used: p.q1_tools_used.trim(),
      q2_frequency: p.q2_frequency || null,
      q3_use_cases: p.q3_use_cases.length > 0 ? p.q3_use_cases : null,
      q3_other: p.q3_other.trim() || null,
      q4_frustrations: p.q4_frustrations.length > 0 ? p.q4_frustrations : null,
      q4_other: p.q4_other.trim() || null,
      q5_curriculum_fit: p.q5_curriculum_fit,
      q6_wish: p.q6_wish.trim() || null,
      q7_try_likelihood: p.q7_try_likelihood,
      q8_top_feature: p.q8_top_feature,
      q8_other: p.q8_other.trim() || null,
      q9_blockers: p.q9_blockers.length > 0 ? p.q9_blockers : null,
      q9_other: p.q9_other.trim() || null,
      q10_extra: p.q10_extra.trim() || null,
    })
    .select("id")
    .single();

  if (responseError || !responseRow) {
    console.error("survey insert failed:", responseError);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  const responseId = responseRow.id as string;

  const { error: signupError } = await supabase
    .from("beta_signups")
    .insert({ email: p.email.trim(), response_id: responseId });
  if (signupError && signupError.code !== "23505") {
    // Survey row already saved — don't fail the request over a signup issue
    console.error("beta_signups insert failed:", signupError);
  }

  sendSurveyConfirmation({
    to: p.email.trim(),
    name: p.respondent_name.trim(),
  }).catch((e) => {
    console.error("survey confirmation email failed:", {
      response_id: responseId,
      error: e instanceof Error ? e.message : String(e),
    });
  });

  return NextResponse.json({ id: responseId }, { status: 200 });
}
