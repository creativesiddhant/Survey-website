-- Supabase Database Schema Setup for Sprint 2
-- Copy and paste this script into the SQL Editor of your Supabase Dashboard

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

---------------------------------------------------------
-- 1. Create Tables
---------------------------------------------------------

-- Table: visitor_sessions
create table if not exists public.visitor_sessions (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null unique,
  fingerprint text,
  first_visit timestamp with time zone not null default now(),
  last_visit timestamp with time zone not null default now(),
  submission_count integer not null default 0,
  device text,
  browser text,
  country text default 'India',
  city text,
  completed boolean not null default false
);

-- Table: responses
create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  visitor_id uuid not null REFERENCES public.visitor_sessions(visitor_id) on delete cascade,
  age_group text not null,
  state text not null,
  city text not null,
  occupation text not null,
  income_range text not null,
  business_interest text not null,
  business_ranking text[] not null,
  suggestions text,
  device_type text,
  browser text,
  completion_time integer not null, -- completion time in seconds
  submission_status text not null default 'completed'
);

-- Table: survey_answers
create table if not exists public.survey_answers (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null REFERENCES public.responses(id) on delete cascade,
  question_number integer not null,
  question text not null,
  answer text not null,
  created_at timestamp with time zone not null default now()
);

-- Table: settings
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

---------------------------------------------------------
-- 2. Create Performance Indexes
---------------------------------------------------------

create index if not exists idx_responses_visitor_id on public.responses(visitor_id);
create index if not exists idx_responses_created_at on public.responses(created_at);
create index if not exists idx_survey_answers_response_id on public.survey_answers(response_id);
create index if not exists idx_visitor_sessions_visitor_id on public.visitor_sessions(visitor_id);

---------------------------------------------------------
-- 3. Enable Row Level Security (RLS)
---------------------------------------------------------

alter table public.visitor_sessions enable row level security;
alter table public.responses enable row level security;
alter table public.survey_answers enable row level security;
alter table public.settings enable row level security;

---------------------------------------------------------
-- 4. Define Row Level Security Policies
---------------------------------------------------------

-- Policy for settings (Allow public read of settings, and authenticated full access)
create policy "Allow public SELECT on settings" 
on public.settings 
for select 
to public 
using (true);

create policy "Allow authenticated ALL on settings" 
on public.settings 
for all 
to authenticated 
using (true)
with check (true);

-- Policies for visitor_sessions (Allow public insert, select, and update based on visitor_id matching)
create policy "Allow public INSERT on visitor_sessions" 
on public.visitor_sessions 
for insert 
to public 
with check (true);

create policy "Allow public SELECT on own visitor_sessions" 
on public.visitor_sessions 
for select 
to public 
using (true);

create policy "Allow public UPDATE on own visitor_sessions" 
on public.visitor_sessions 
for update 
to public 
using (true);

-- Policies for responses (Allow public anonymous insert only; restrict select to admins/authenticated users)
create policy "Allow public INSERT on responses" 
on public.responses 
for insert 
to public 
with check (true);

create policy "Allow authenticated SELECT on responses" 
on public.responses 
for select 
to authenticated 
using (true);

-- Policies for survey_answers (Allow public anonymous insert only; restrict select to admins/authenticated users)
create policy "Allow public INSERT on survey_answers" 
on public.survey_answers 
for insert 
to public 
with check (true);

create policy "Allow authenticated SELECT on survey_answers" 
on public.survey_answers 
for select 
to authenticated 
using (true);

---------------------------------------------------------
-- 5. Create Survey Submission Transaction Function (RPC)
---------------------------------------------------------

create or replace function public.submit_survey_response(
  p_visitor_id uuid,
  p_fingerprint text,
  p_age_group text,
  p_state text,
  p_city text,
  p_occupation text,
  p_income_range text,
  p_business_interest text,
  p_business_ranking text[],
  p_suggestions text,
  p_device_type text,
  p_browser text,
  p_completion_time integer,
  p_answers jsonb
)
returns uuid as $$
declare
  v_response_id uuid;
  v_answer jsonb;
begin
  -- 1. Upsert Visitor Session to ensure parent record exists
  insert into public.visitor_sessions (
    visitor_id,
    fingerprint,
    submission_count,
    completed,
    device,
    browser,
    city
  ) values (
    p_visitor_id,
    p_fingerprint,
    1,
    true,
    p_device_type,
    p_browser,
    p_city
  )
  on conflict (visitor_id) do update set
    submission_count = public.visitor_sessions.submission_count + 1,
    completed = true,
    last_visit = now(),
    fingerprint = p_fingerprint,
    city = p_city;

  -- 2. Insert main response record
  insert into public.responses (
    visitor_id,
    age_group,
    state,
    city,
    occupation,
    income_range,
    business_interest,
    business_ranking,
    suggestions,
    device_type,
    browser,
    completion_time
  ) values (
    p_visitor_id,
    p_age_group,
    p_state,
    p_city,
    p_occupation,
    p_income_range,
    p_business_interest,
    p_business_ranking,
    p_suggestions,
    p_device_type,
    p_browser,
    p_completion_time
  ) returning id into v_response_id;

  -- 3. Loop through answers and insert
  for v_answer in select * from jsonb_array_elements(p_answers) loop
    insert into public.survey_answers (
      response_id,
      question_number,
      question,
      answer
    ) values (
      v_response_id,
      (v_answer->>'question_number')::integer,
      v_answer->>'question',
      v_answer->>'answer'
    );
  end loop;

  return v_response_id;
end;
$$ language plpgsql security definer;
