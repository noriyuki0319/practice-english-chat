-- ============================================================================
-- Migration: Create profiles table
-- Description: User profile information linked to auth.users
-- ============================================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comment to table
COMMENT ON TABLE public.profiles IS 'User profile information linked to Supabase auth.users';

-- Add comments to columns
COMMENT ON COLUMN public.profiles.id IS 'User ID from auth.users (Primary Key)';
COMMENT ON COLUMN public.profiles.name IS 'Display name of the user';
COMMENT ON COLUMN public.profiles.created_at IS 'Timestamp when the profile was created';
COMMENT ON COLUMN public.profiles.updated_at IS 'Timestamp when the profile was last updated';

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete their own profile"
    ON public.profiles
    FOR DELETE
    USING (auth.uid() = id);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at on profiles
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- Indexes
-- ============================================================================

-- Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- ============================================================================
-- Rollback (commented out - uncomment if needed)
-- ============================================================================
-- DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
-- DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
-- DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
-- DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
-- DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
-- DROP TABLE IF EXISTS public.profiles;
-- DROP FUNCTION IF EXISTS public.handle_updated_at();

