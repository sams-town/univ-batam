-- =======================================================
-- MIGRATION: ALTER PROFILES TABLE (FIX EMPLOYEE/LECTURER INSERTS)
-- VERSION: 1.0
-- DESCRIPTION: Adds missing demographic and address columns, drops strict foreign key to auth.users, and sets default uuid generation.
-- =======================================================

-- 1. Add missing demographic and address columns to public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS place_of_birth VARCHAR(100);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_ktp TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_domicile TEXT;

-- 2. Drop the strict foreign key constraint referencing auth.users(id)
-- This allows administrators to insert profiles directly from the admin dashboard (e.g. lecturers and employees)
-- without requiring an auth user to be created first in Supabase Auth.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 3. Set a default value to auto-generate UUIDs for profiles.id when not explicitly passed
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
