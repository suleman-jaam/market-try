-- =====================================================
-- Naba Sooq — Full Database Setup (Safe / Idempotent)
-- Run this in your Supabase SQL Editor.
-- It is safe to run multiple times — it won't duplicate anything.
-- =====================================================


-- ── 1. PROFILES ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE NOT NULL,
  email         TEXT,
  first_name    TEXT,
  last_name     TEXT,
  display_name  TEXT,
  bio           TEXT,
  location      TEXT,
  website_url   TEXT,
  avatar_url    TEXT,
  banner_url    TEXT,
  seller_score  NUMERIC DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist even if the table was created before (via dashboard or old SQL)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name    TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name     TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name  TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio           TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location      TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url   TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url    TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url    TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS seller_score  NUMERIC DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email         TEXT;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);


-- ── 2. POSTS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.posts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL CHECK (char_length(content) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
CREATE POLICY "Posts are viewable by everyone"
  ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
CREATE POLICY "Authenticated users can create posts"
  ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE USING (auth.uid() = user_id);


-- ── 3. LIKES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.likes (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id)    ON DELETE CASCADE,
  PRIMARY KEY (user_id, post_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.likes;
CREATE POLICY "Likes are viewable by everyone"
  ON public.likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can like posts" ON public.likes;
CREATE POLICY "Authenticated users can like posts"
  ON public.likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike their own likes" ON public.likes;
CREATE POLICY "Users can unlike their own likes"
  ON public.likes FOR DELETE USING (auth.uid() = user_id);


-- ── 4. COMMENTS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id    UUID NOT NULL REFERENCES public.posts(id)    ON DELETE CASCADE,
  content    TEXT NOT NULL CHECK (char_length(content) <= 280),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE USING (auth.uid() = user_id);


-- ── 5. FOLLOWS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
CREATE POLICY "Follows are viewable by everyone"
  ON public.follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can follow" ON public.follows;
CREATE POLICY "Authenticated users can follow"
  ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE USING (auth.uid() = follower_id);


-- ── 6. TAGS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tags (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tags are viewable by everyone" ON public.tags;
CREATE POLICY "Tags are viewable by everyone"
  ON public.tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create tags" ON public.tags;
CREATE POLICY "Authenticated users can create tags"
  ON public.tags FOR INSERT TO authenticated WITH CHECK (true);


-- ── 7. POST_TAGS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.post_tags (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES public.tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Post tags are viewable by everyone" ON public.post_tags;
CREATE POLICY "Post tags are viewable by everyone"
  ON public.post_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can tag posts" ON public.post_tags;
CREATE POLICY "Authenticated users can tag posts"
  ON public.post_tags FOR INSERT TO authenticated WITH CHECK (true);


-- ── 8. STORAGE BUCKET ────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile_images', 'profile_images', true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']::text[]
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']::text[];

-- Drop existing storage policies before recreating (avoids "already exists" error)
DROP POLICY IF EXISTS "Allow authenticated uploads to profile_images"       ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own profile images"       ON storage.objects;
DROP POLICY IF EXISTS "Allow public read of profile_images"                  ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own profile images"       ON storage.objects;

CREATE POLICY "Allow authenticated uploads to profile_images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile_images');

CREATE POLICY "Allow users to update their own profile images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'profile_images' AND auth.uid() = owner);

CREATE POLICY "Allow public read of profile_images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile_images');

CREATE POLICY "Allow users to delete their own profile images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'profile_images' AND auth.uid() = owner);


-- ── 9. AUTO-CREATE PROFILE ON SIGNUP (Trigger) ───────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || LEFT(NEW.id::text, 6)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── 10. NOTIFICATIONS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (user_id <> actor_id) -- Users shouldn't notify themselves
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger: Create notification on follow
CREATE OR REPLACE FUNCTION public.handle_new_follow()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, actor_id, type)
  VALUES (NEW.following_id, NEW.follower_id, 'follow');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_follow_created ON public.follows;
CREATE TRIGGER on_follow_created
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_follow();


-- ── 11. GRANT PRIVILEGES ─────────────────────────────
-- Required for manually-created tables in Supabase.
-- RLS policies alone are not enough — the role must also
-- have base-level GRANT access on each table.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts          TO authenticated;
GRANT SELECT, INSERT, DELETE         ON public.likes          TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments       TO authenticated;
GRANT SELECT, INSERT, DELETE         ON public.follows        TO authenticated;
GRANT SELECT, INSERT                 ON public.tags           TO authenticated;
GRANT SELECT, INSERT                 ON public.post_tags      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications  TO authenticated;

-- Allow unauthenticated (logged-out) users to read public data
GRANT SELECT ON public.profiles  TO anon;
GRANT SELECT ON public.posts     TO anon;
GRANT SELECT ON public.likes     TO anon;
GRANT SELECT ON public.comments  TO anon;
GRANT SELECT ON public.follows   TO anon;
GRANT SELECT ON public.tags      TO anon;
GRANT SELECT ON public.post_tags TO anon;

