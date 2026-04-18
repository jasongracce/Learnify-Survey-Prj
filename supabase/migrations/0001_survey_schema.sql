-- Survey page schema
-- Run this in the Supabase SQL editor on a fresh project.

create extension if not exists "pgcrypto";

create table if not exists survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  language text not null check (language in ('en', 'th')),
  q1_tools_used text not null,
  q2_frequency text,
  q3_use_cases text[],
  q3_other text,
  q4_frustration text,
  q4_other text,
  q5_curriculum_fit smallint check (q5_curriculum_fit between 1 and 5),
  q6_wish text,
  q7_try_likelihood smallint not null check (q7_try_likelihood between 1 and 5),
  q8_top_feature text not null,
  q8_other text,
  q9_blockers text[],
  q9_other text,
  q10_extra text
);

alter table survey_responses enable row level security;

drop policy if exists "anon can insert responses" on survey_responses;
create policy "anon can insert responses"
  on survey_responses
  for insert
  to anon
  with check (true);

create table if not exists beta_signups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique,
  response_id uuid references survey_responses(id) on delete set null
);

alter table beta_signups enable row level security;

drop policy if exists "anon can insert signups" on beta_signups;
create policy "anon can insert signups"
  on beta_signups
  for insert
  to anon
  with check (true);
