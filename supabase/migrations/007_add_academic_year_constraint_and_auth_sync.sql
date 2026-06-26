-- =======================================================
-- MIGRATION: ADD ACADEMIC YEAR CONSTRAINT AND AUTH SYNC
-- VERSION: 1.0
-- DESCRIPTION: Enforces single active academic year and synchronizes roles to metadata
-- =======================================================

-- 1. Enforce only one active academic year at a time
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_academic_year 
ON public.academic_years (is_active) 
WHERE (is_active = true);

-- 2. Add role column to profiles table for fast access
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50);

-- 3. Trigger to sync profiles.role with roles.name automatically
CREATE OR REPLACE FUNCTION public.sync_profile_role() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role_id IS NOT NULL THEN
        SELECT name INTO NEW.role FROM public.roles WHERE id = NEW.role_id;
    ELSE
        NEW.role := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_profile_role ON public.profiles;

CREATE TRIGGER trg_sync_profile_role
BEFORE INSERT OR UPDATE OF role_id ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_role();

-- Update existing profiles' role names
UPDATE public.profiles p
SET role = r.name
FROM public.roles r
WHERE p.role_id = r.id;

-- 4. Trigger to sync profiles.role to auth.users raw_user_meta_data for JWT embedding
CREATE OR REPLACE FUNCTION public.sync_auth_user_role() 
RETURNS TRIGGER AS $$
DECLARE
    role_name VARCHAR(50);
BEGIN
    SELECT name INTO role_name FROM public.roles WHERE id = NEW.role_id;
    
    UPDATE auth.users 
    SET raw_user_meta_data = 
        coalesce(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', role_name)
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_auth_user_role ON public.profiles;

CREATE TRIGGER trg_sync_auth_user_role
AFTER INSERT OR UPDATE OF role_id ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_auth_user_role();

-- Sync existing users metadata in auth.users
UPDATE auth.users u
SET raw_user_meta_data = 
    coalesce(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', r.name)
FROM public.profiles p
JOIN public.roles r ON p.role_id = r.id
WHERE u.id = p.id;
