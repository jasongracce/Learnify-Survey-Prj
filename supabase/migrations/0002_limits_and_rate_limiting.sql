-- Length/format constraints + rate-limit tracking.
-- Revokes anon INSERT; from this migration forward all writes flow through
-- the /api/survey/submit route using the service_role key.

-- Length caps on survey_responses free-text columns
alter table survey_responses
  add constraint survey_responses_respondent_name_len
    check (char_length(respondent_name) <= 100),
  add constraint survey_responses_q1_tools_used_len
    check (char_length(q1_tools_used) <= 500),
  add constraint survey_responses_q3_other_len
    check (q3_other is null or char_length(q3_other) <= 500),
  add constraint survey_responses_q4_other_len
    check (q4_other is null or char_length(q4_other) <= 500),
  add constraint survey_responses_q8_other_len
    check (q8_other is null or char_length(q8_other) <= 500),
  add constraint survey_responses_q9_other_len
    check (q9_other is null or char_length(q9_other) <= 500),
  add constraint survey_responses_q6_wish_len
    check (q6_wish is null or char_length(q6_wish) <= 2000),
  add constraint survey_responses_q10_extra_len
    check (q10_extra is null or char_length(q10_extra) <= 2000);

-- Email length + format on beta_signups
alter table beta_signups
  add constraint beta_signups_email_len
    check (char_length(email) <= 254),
  add constraint beta_signups_email_format
    check (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$');

-- Rate-limit tracking
create table if not exists submission_attempts (
  id          uuid primary key default gen_random_uuid(),
  ip          text not null,
  created_at  timestamptz not null default now()
);
create index if not exists submission_attempts_ip_created_at_idx
  on submission_attempts (ip, created_at desc);

alter table submission_attempts enable row level security;
-- no policies granted: service_role bypasses RLS, everyone else is locked out

-- Close the anon write paths
drop policy if exists "anon can insert responses" on survey_responses;
drop policy if exists "anon can insert signups" on beta_signups;
