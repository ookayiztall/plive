
-- ROLES
create type public.app_role as enum ('admin','moderator','user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- shared updated_at
create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- PROFILES
create table public.profiles (
  id uuid primary key,
  display_name text not null default '',
  email text not null default '',
  avatar_url text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "users read own profile" on public.profiles for select to authenticated using (auth.uid() = id or public.has_role(auth.uid(),'admin'));
create policy "users update own profile" on public.profiles for update to authenticated using (auth.uid() = id or public.has_role(auth.uid(),'admin')) with check (auth.uid() = id or public.has_role(auth.uid(),'admin'));
create policy "users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create trigger profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at_column();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, email, avatar_url)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
          coalesce(new.email,''),
          new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- CATEGORIES
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  "group" text not null default '',
  icon text not null default 'Trophy',
  color text not null default '#f5a524',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.categories to anon;
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "anyone reads active categories" on public.categories for select to anon, authenticated using (is_active or public.has_role(auth.uid(),'admin'));
create policy "admins manage categories" on public.categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger categories_updated_at before update on public.categories for each row execute function public.update_updated_at_column();

-- STREAMS
create table public.streams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text not null default '',
  description text not null default '',
  category_id uuid references public.categories(id) on delete set null,
  thumbnail_url text,
  hero_url text,
  type text not null default 'event',
  status text not null default 'scheduled',
  visibility text not null default 'public',
  starts_at timestamptz,
  ends_at timestamptz,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  viewers integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.streams to anon;
grant select, insert, update, delete on public.streams to authenticated;
grant all on public.streams to service_role;
alter table public.streams enable row level security;
create policy "anon reads public streams" on public.streams for select to anon using (is_active and visibility = 'public' and status <> 'draft');
create policy "members read streams" on public.streams for select to authenticated using ((is_active and status <> 'draft') or public.has_role(auth.uid(),'admin'));
create policy "admins manage streams" on public.streams for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger streams_updated_at before update on public.streams for each row execute function public.update_updated_at_column();
create index streams_category_idx on public.streams(category_id);
create index streams_status_idx on public.streams(status);

-- STREAM SOURCES
create table public.stream_sources (
  id uuid primary key default gen_random_uuid(),
  stream_id uuid not null references public.streams(id) on delete cascade,
  name text not null default 'Main Stream',
  description text not null default '',
  type text not null default 'hls',
  url text not null,
  priority integer not null default 1,
  is_active boolean not null default true,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.stream_sources to anon;
grant select, insert, update, delete on public.stream_sources to authenticated;
grant all on public.stream_sources to service_role;
alter table public.stream_sources enable row level security;
create policy "anon reads sources of public streams" on public.stream_sources for select to anon using (
  is_active and exists (select 1 from public.streams s where s.id = stream_id and s.is_active and s.visibility = 'public' and s.status <> 'draft')
);
create policy "members read sources" on public.stream_sources for select to authenticated using (
  public.has_role(auth.uid(),'admin') or (is_active and exists (select 1 from public.streams s where s.id = stream_id and s.is_active and s.status <> 'draft'))
);
create policy "admins manage sources" on public.stream_sources for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger stream_sources_updated_at before update on public.stream_sources for each row execute function public.update_updated_at_column();
create index stream_sources_stream_idx on public.stream_sources(stream_id);

-- SITE SETTINGS
create table public.site_settings (
  id boolean primary key default true,
  site_name text not null default 'PLive',
  site_description text not null default 'Live sports streaming',
  timezone text not null default 'UTC',
  registration_enabled boolean not null default true,
  copyright_text text not null default '© PLive. All rights reserved.',
  footer_cta_text text not null default 'Join our Telegram for stream updates',
  footer_cta_label text not null default 'Join Telegram',
  footer_cta_url text not null default 'https://t.me/',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_settings_single_row check (id)
);
grant select on public.site_settings to anon;
grant select, insert, update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "anyone reads settings" on public.site_settings for select to anon, authenticated using (true);
create policy "admins write settings" on public.site_settings for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger site_settings_updated_at before update on public.site_settings for each row execute function public.update_updated_at_column();

insert into public.site_settings (id) values (true);

-- SEED CATEGORIES
insert into public.categories (name, slug, description, "group", icon, color, sort_order) values
  ('Premier League','premier-league','English top flight football','Football','Trophy','#f5a524',1),
  ('La Liga','la-liga','Spanish top flight football','Football','Trophy','#e0592a',2),
  ('Serie A','serie-a','Italian top flight football','Football','Trophy','#3b82f6',3),
  ('Bundesliga','bundesliga','German top flight football','Football','Trophy','#ef4444',4),
  ('Champions League','champions-league','European club competition','Football','Star','#8b5cf6',5),
  ('International','international','National team fixtures','Football','Globe','#14b8a6',6),
  ('UFC','ufc','Mixed martial arts events','Combat Sports','Swords','#f43f5e',7),
  ('Boxing','boxing','Championship boxing cards','Combat Sports','Swords','#f59e0b',8),
  ('Formula 1','formula-1','Race weekends and qualifying','Formula 1','Flag','#22c55e',9),
  ('NBA','nba','North American basketball','Basketball','Dribbble','#0ea5e9',10);

-- SEED STREAMS
insert into public.streams (title, slug, short_description, description, category_id, type, status, visibility, starts_at, ends_at, is_featured, is_active, viewers)
values
  ('Aston Villa vs Arsenal','aston-villa-vs-arsenal','Premier League matchday coverage.','Full live coverage including pre-match build up and post-match analysis.',(select id from public.categories where slug='premier-league'),'event','live','public', now() - interval '36 minutes', now() + interval '84 minutes', true, true, 412),
  ('Barcelona vs Rayo Vallecano','barcelona-vs-rayo-vallecano','La Liga fixture live from Catalonia.','La Liga action with full match feed and alternative commentary sources.',(select id from public.categories where slug='la-liga'),'event','live','public', now() - interval '12 minutes', now() + interval '108 minutes', true, true, 268),
  ('Ipswich Town vs Liverpool','ipswich-town-vs-liverpool','Premier League away day fixture.','Live coverage with multiple match feeds.',(select id from public.categories where slug='premier-league'),'event','scheduled','public', now() + interval '28 hours', now() + interval '30 hours', true, true, null),
  ('Monday Serie A Matches','monday-serie-a-matches','Serie A multi-match coverage.','A combined feed of Monday night Serie A fixtures.',(select id from public.categories where slug='serie-a'),'event','scheduled','public', now() + interval '6 hours', now() + interval '9 hours', false, true, null),
  ('Bayern Munich vs Leverkusen','bayern-munich-vs-leverkusen','Bundesliga top of the table clash.','Bundesliga headline fixture with full live coverage.',(select id from public.categories where slug='bundesliga'),'event','scheduled','registered', now() + interval '20 hours', now() + interval '22 hours', false, true, null),
  ('UFC Fight Night: Hooker vs Parnasse','ufc-fight-night-hooker-vs-parnasse','Main card and prelims coverage.','Full fight night coverage including prelims and main card.',(select id from public.categories where slug='ufc'),'event','scheduled','public', now() + interval '120 hours', now() + interval '126 hours', true, true, null),
  ('Championship Boxing: Title Night','championship-boxing-title-night','World title fight night.','Championship boxing card with undercard bouts.',(select id from public.categories where slug='boxing'),'event','scheduled','public', now() + interval '72 hours', now() + interval '77 hours', false, true, null),
  ('Formula 1 Italian Grand Prix','formula-1-italian-grand-prix','Race weekend live coverage.','Practice, qualifying and race day coverage.',(select id from public.categories where slug='formula-1'),'event','scheduled','public', now() + interval '150 hours', now() + interval '153 hours', true, true, null),
  ('NBA Regular Season: Nightcap','nba-regular-season-nightcap','Late tip-off basketball coverage.','NBA regular season coverage with alternative commentary feed.',(select id from public.categories where slug='nba'),'event','live','public', now() - interval '66 minutes', now() + interval '60 minutes', false, true, 137),
  ('Sky Sports Main Event','sky-sports-main-event','24/7 coverage of the biggest live events.','An always-on channel carrying the biggest live events of the day.',(select id from public.categories where slug='international'),'channel','live','registered', null, null, true, true, 1),
  ('TNT Sport 1','tnt-sport-1','24/7 sports channel stream.','Round the clock sports channel with live fixtures and replays.',(select id from public.categories where slug='premier-league'),'channel','live','registered', null, null, false, true, 3),
  ('ESPN Live','espn-live','24/7 international sports channel.','Continuous sports programming with international events and analysis.',(select id from public.categories where slug='nba'),'channel','live','public', null, null, false, true, 2);

insert into public.stream_sources (stream_id, name, description, type, url, priority, is_default)
select s.id, 'Main Stream', 'Recommended source', 'hls', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', 1, true from public.streams s;
insert into public.stream_sources (stream_id, name, description, type, url, priority, is_default)
select s.id, 'Stream 2', 'Backup source', 'hls', 'https://test-streams.mux.dev/pts_shift/master.m3u8', 2, false from public.streams s;
