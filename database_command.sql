-- SQL commands to add new profile fields to the 'profiles' table
-- You can copy and paste this into your Supabase SQL Editor and click "Run"

-- 1. Drop the old avatar_url column (WARNING: This will delete existing avatar URLs!)
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS avatar_url;

-- 2. Add the new columns (including re-adding avatar_url if you still need it, 
-- or you can rename it to dp_url if you prefer. I've kept it as avatar_url below for compatibility)
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS banner_url TEXT,
  ADD COLUMN IF NOT EXISTS seller_score NUMERIC DEFAULT 0;

-- 3. Create the 'profile_images' storage bucket with strict limits
-- This makes it public, limits file size to 5MB, and restricts to common image formats.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile_images', 
  'profile_images', 
  true, 
  5242880, -- 5MB in bytes (5 * 1024 * 1024)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']::text[]
) ON CONFLICT (id) DO UPDATE SET 
  public = true, 
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']::text[];

-- 4. Create Row-Level Security (RLS) policies for the 'profile_images' bucket
-- These policies are REQUIRED to allow users to actually upload files.
-- Without them, Supabase blocks uploads with a "violates row-level security policy" error.

-- Allow authenticated users to upload new files
CREATE POLICY "Allow authenticated uploads to profile_images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'profile_images' );

-- Allow users to update their own files (important since we use { upsert: true })
CREATE POLICY "Allow users to update their own profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'profile_images' AND auth.uid() = owner );

-- Allow anyone to read objects via the API (public URL already works, but this is good practice)
CREATE POLICY "Allow public read of profile_images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'profile_images' );

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete their own profile images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'profile_images' AND auth.uid() = owner );
