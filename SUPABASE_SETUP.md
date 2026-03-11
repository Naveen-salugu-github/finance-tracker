# Supabase setup (auth + user profiles)

Use Supabase for login and to store user profiles (name, income, etc.) so you can track your userbase and show a personalized welcome.

---

## 1. Create a Supabase project

1. Go to **https://supabase.com** and sign in.
2. Create a new project (e.g. `finance-tracker`).
3. Wait for the project to be ready, then open **Settings → API**.
4. Copy:
   - **Project URL**
   - **anon public** key (safe to use in the frontend).

---

## 2. Environment variables

In `frontend/.env` (or Vercel env vars for deploy) add:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Do not commit real keys. For local dev you can use `frontend/.env.local` (gitignored).

---

## 3. Create the `profiles` table

In the Supabase dashboard go to **SQL Editor** and run:

```sql
-- Profiles table (one row per user, synced with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  monthly_income numeric not null default 0,
  emergency_savings numeric not null default 0,
  income_type text not null default 'Salaried',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: users can read/update only their own row
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Optional: create a row when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

This gives you:

- **profiles** table with `id`, `email`, `first_name`, `last_name`, `monthly_income`, `emergency_savings`, `income_type`, timestamps.
- RLS so each user can only read/update their own profile.
- Optional trigger to create a profile row when someone signs up (so the app can upsert without failing on first save).

---

## 3b. Create the `obligations` table (restore after sign-in)

Run this in the SQL Editor so obligations are stored per user and restored when they log back in:

```sql
create table if not exists public.obligations (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  monthly_amount numeric not null default 0,
  due_date smallint,
  created_at timestamptz default now(),
  primary key (user_id, id)
);

alter table public.obligations enable row level security;

create policy "Users can read own obligations"
  on public.obligations for select using (auth.uid() = user_id);

create policy "Users can insert own obligations"
  on public.obligations for insert with check (auth.uid() = user_id);

create policy "Users can update own obligations"
  on public.obligations for update using (auth.uid() = user_id);

create policy "Users can delete own obligations"
  on public.obligations for delete using (auth.uid() = user_id);
```

---

## 4. Auth settings (optional)

In Supabase **Authentication → Settings** you can:

- Enable **Email** provider (usually on by default).
- Turn off **Confirm email** if you want immediate sign-in without verification (dev only).

---

## 5. Test

1. Run the app (`npx expo start` from `frontend/`).
2. Open the app → you should be redirected to the **Login** screen.
3. Sign up with email/password.
4. After sign-in you land on the Dashboard. Go to **Profile**, add First name, Last name, income, and tap **Save Profile**.
5. You should see the “You’re registered!” popup, and the dashboard header should show **Welcome, &lt;Last name&gt;**.

---

## Summary

| What            | Where        | Note                          |
|-----------------|-------------|-------------------------------|
| Auth            | Supabase    | Email/password sign in / up   |
| User profiles   | Supabase    | `profiles` table, RLS         |
| Obligations     | Supabase    | `obligations` table, RLS      |
| Env vars        | `frontend`  | `EXPO_PUBLIC_SUPABASE_*`      |

Userbase is all users in **Authentication → Users**; profile data is in **Table Editor → profiles**.
