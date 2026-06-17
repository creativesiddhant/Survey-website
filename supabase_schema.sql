-- Supabase Table Setup for Survey Responses
-- Copy and paste this script into the SQL Editor of your Supabase Dashboard

-- 1. Create the table
create table if not exists public.survey_responses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  age_group text not null,
  state text not null,
  city text not null,
  occupation text not null,
  monthly_income text not null,
  excited_business text not null,
  ranking text[] not null,
  suggestions text
);

-- 2. Enable Row Level Security (RLS)
alter table public.survey_responses enable row level security;

-- 3. Create a policy to allow public inserts (anonymous survey submissions)
create policy "Allow anonymous inserts"
on public.survey_responses
for insert
with check (true);

-- 4. (Optional) Create a policy to allow authenticated users (like administrators) to view responses
create policy "Allow authenticated selects"
on public.survey_responses
for select
to authenticated
using (true);
