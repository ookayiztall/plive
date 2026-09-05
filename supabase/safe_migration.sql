-- Safe migration: handles already-existing objects
-- Run this instead of the original migration 1

-- ROLES
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

DO $$ BEGIN
  CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- shared updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  display_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  avatar_url text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email, avatar_url)
  VALUES (new.id,
          coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
          coalesce(new.email,''),
          new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'user') ON CONFLICT DO NOTHING;
  RETURN new;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  "group" text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'Trophy',
  color text NOT NULL DEFAULT '#f5a524',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "anyone reads active categories" ON public.categories FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admins manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP TRIGGER IF EXISTS categories_updated_at ON public.categories;
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- STREAMS
CREATE TABLE IF NOT EXISTS public.streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  short_description text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  thumbnail_url text,
  hero_url text,
  type text NOT NULL DEFAULT 'event',
  status text NOT NULL DEFAULT 'scheduled',
  visibility text NOT NULL DEFAULT 'public',
  starts_at timestamptz,
  ends_at timestamptz,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  viewers integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.streams TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.streams TO authenticated;
GRANT ALL ON public.streams TO service_role;
ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "anon reads public streams" ON public.streams FOR SELECT TO anon USING (is_active AND visibility = 'public' AND status <> 'draft');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members read streams" ON public.streams FOR SELECT TO authenticated USING ((is_active AND status <> 'draft') OR public.has_role(auth.uid(),'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admins manage streams" ON public.streams FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP TRIGGER IF EXISTS streams_updated_at ON public.streams;
CREATE TRIGGER streams_updated_at BEFORE UPDATE ON public.streams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS streams_category_idx ON public.streams(category_id);
CREATE INDEX IF NOT EXISTS streams_status_idx ON public.streams(status);

-- STREAM SOURCES
CREATE TABLE IF NOT EXISTS public.stream_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id uuid NOT NULL REFERENCES public.streams(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Main Stream',
  description text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'hls',
  url text NOT NULL,
  priority integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stream_sources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stream_sources TO authenticated;
GRANT ALL ON public.stream_sources TO service_role;
ALTER TABLE public.stream_sources ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "anon reads sources of public streams" ON public.stream_sources FOR SELECT TO anon USING (
    is_active AND EXISTS (SELECT 1 FROM public.streams s WHERE s.id = stream_id AND s.is_active AND s.visibility = 'public' AND s.status <> 'draft')
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "members read sources" ON public.stream_sources FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(),'admin') OR (is_active AND EXISTS (SELECT 1 FROM public.streams s WHERE s.id = stream_id AND s.is_active AND s.status <> 'draft'))
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admins manage sources" ON public.stream_sources FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP TRIGGER IF EXISTS stream_sources_updated_at ON public.stream_sources;
CREATE TRIGGER stream_sources_updated_at BEFORE UPDATE ON public.stream_sources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS stream_sources_stream_idx ON public.stream_sources(stream_id);

-- SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
  id boolean PRIMARY KEY DEFAULT true,
  site_name text NOT NULL DEFAULT 'PLive',
  site_description text NOT NULL DEFAULT 'Live sports streaming',
  timezone text NOT NULL DEFAULT 'UTC',
  registration_enabled boolean NOT NULL DEFAULT true,
  copyright_text text NOT NULL DEFAULT '© PLive. All rights reserved.',
  footer_cta_text text NOT NULL DEFAULT 'Join our Telegram for stream updates',
  footer_cta_label text NOT NULL DEFAULT 'Join Telegram',
  footer_cta_url text NOT NULL DEFAULT 'https://t.me/',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_single_row CHECK (id)
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "anyone reads settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admins write settings" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP TRIGGER IF EXISTS site_settings_updated_at ON public.site_settings;
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

-- SEED CATEGORIES (skip if slug already exists)
INSERT INTO public.categories (name, slug, description, "group", icon, color, sort_order) VALUES
  ('Premier League','premier-league','English top flight football','Football','Trophy','#f5a524',1),
  ('La Liga','la-liga','Spanish top flight football','Football','Trophy','#e0592a',2),
  ('Serie A','serie-a','Italian top flight football','Football','Trophy','#3b82f6',3),
  ('Bundesliga','bundesliga','German top flight football','Football','Trophy','#ef4444',4),
  ('Champions League','champions-league','European club competition','Football','Star','#8b5cf6',5),
  ('International','international','National team fixtures','Football','Globe','#14b8a6',6),
  ('UFC','ufc','Mixed martial arts events','Combat Sports','Swords','#f43f5e',7),
  ('Boxing','boxing','Championship boxing cards','Combat Sports','Swords','#f59e0b',8),
  ('Formula 1','formula-1','Race weekends and qualifying','Formula 1','Flag','#22c55e',9),
  ('NBA','nba','North American basketball','Basketball','Dribbble','#0ea5e9',10)
ON CONFLICT (slug) DO NOTHING;

-- SEED STREAMS (skip if slug already exists)
INSERT INTO public.streams (title, slug, short_description, description, category_id, type, status, visibility, starts_at, ends_at, is_featured, is_active, viewers)
VALUES
  ('Aston Villa vs Arsenal','aston-villa-vs-arsenal','Premier League matchday coverage.','Full live coverage including pre-match build up and post-match analysis.',(SELECT id FROM public.categories WHERE slug='premier-league'),'event','live','public', now() - interval '36 minutes', now() + interval '84 minutes', true, true, 412),
  ('Barcelona vs Rayo Vallecano','barcelona-vs-rayo-vallecano','La Liga fixture live from Catalonia.','La Liga action with full match feed and alternative commentary sources.',(SELECT id FROM public.categories WHERE slug='la-liga'),'event','live','public', now() - interval '12 minutes', now() + interval '108 minutes', true, true, 268),
  ('Ipswich Town vs Liverpool','ipswich-town-vs-liverpool','Premier League away day fixture.','Live coverage with multiple match feeds.',(SELECT id FROM public.categories WHERE slug='premier-league'),'event','scheduled','public', now() + interval '28 hours', now() + interval '30 hours', true, true, null),
  ('Monday Serie A Matches','monday-serie-a-matches','Serie A multi-match coverage.','A combined feed of Monday night Serie A fixtures.',(SELECT id FROM public.categories WHERE slug='serie-a'),'event','scheduled','public', now() + interval '6 hours', now() + interval '9 hours', false, true, null),
  ('Bayern Munich vs Leverkusen','bayern-munich-vs-leverkusen','Bundesliga top of the table clash.','Bundesliga headline fixture with full live coverage.',(SELECT id FROM public.categories WHERE slug='bundesliga'),'event','scheduled','registered', now() + interval '20 hours', now() + interval '22 hours', false, true, null),
  ('UFC Fight Night: Hooker vs Parnasse','ufc-fight-night-hooker-vs-parnasse','Main card and prelims coverage.','Full fight night coverage including prelims and main card.',(SELECT id FROM public.categories WHERE slug='ufc'),'event','scheduled','public', now() + interval '120 hours', now() + interval '126 hours', true, true, null),
  ('Championship Boxing: Title Night','championship-boxing-title-night','World title fight night.','Championship boxing card with undercard bouts.',(SELECT id FROM public.categories WHERE slug='boxing'),'event','scheduled','public', now() + interval '72 hours', now() + interval '77 hours', false, true, null),
  ('Formula 1 Italian Grand Prix','formula-1-italian-grand-prix','Race weekend live coverage.','Practice, qualifying and race day coverage.',(SELECT id FROM public.categories WHERE slug='formula-1'),'event','scheduled','public', now() + interval '150 hours', now() + interval '153 hours', true, true, null),
  ('NBA Regular Season: Nightcap','nba-regular-season-nightcap','Late tip-off basketball coverage.','NBA regular season coverage with alternative commentary feed.',(SELECT id FROM public.categories WHERE slug='nba'),'event','live','public', now() - interval '66 minutes', now() + interval '60 minutes', false, true, 137),
  ('Sky Sports Main Event','sky-sports-main-event','24/7 coverage of the biggest live events.','An always-on channel carrying the biggest live events of the day.',(SELECT id FROM public.categories WHERE slug='international'),'channel','live','registered', null, null, true, true, 1),
  ('TNT Sport 1','tnt-sport-1','24/7 sports channel stream.','Round the clock sports channel with live fixtures and replays.',(SELECT id FROM public.categories WHERE slug='premier-league'),'channel','live','registered', null, null, false, true, 3),
  ('ESPN Live','espn-live','24/7 international sports channel.','Continuous sports programming with international events and analysis.',(SELECT id FROM public.categories WHERE slug='nba'),'channel','live','public', null, null, false, true, 2)
ON CONFLICT (slug) DO NOTHING;

-- SEED STREAM SOURCES (only for streams that don't have sources yet)
INSERT INTO public.stream_sources (stream_id, name, description, type, url, priority, is_default)
SELECT s.id, 'Main Stream', 'Recommended source', 'hls', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', 1, true
FROM public.streams s
WHERE NOT EXISTS (SELECT 1 FROM public.stream_sources ss WHERE ss.stream_id = s.id AND ss.priority = 1);

INSERT INTO public.stream_sources (stream_id, name, description, type, url, priority, is_default)
SELECT s.id, 'Stream 2', 'Backup source', 'hls', 'https://test-streams.mux.dev/pts_shift/master.m3u8', 2, false
FROM public.streams s
WHERE NOT EXISTS (SELECT 1 FROM public.stream_sources ss WHERE ss.stream_id = s.id AND ss.priority = 2);

-- ============================================
-- CATEGORY IMAGES + TELEGRAM + SETTINGS
-- ============================================

-- Add image_url to categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url text DEFAULT NULL;

-- Add telegram_username to site_settings
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS telegram_username text DEFAULT '';
