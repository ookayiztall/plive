import { supabase } from "@/integrations/supabase/client";
import { fallbackImageFor } from "@/lib/images";
import type {
  AppUser,
  Category,
  SiteSettings,
  Stream,
  StreamSource,
  StreamStatus,
  StreamType,
  UserRole,
  UserStatus,
  Visibility,
} from "@/types";

/* ---------------------------------- rows --------------------------------- */

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  group: string;
  icon: string;
  color: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

type SourceRow = {
  id: string;
  stream_id: string;
  name: string;
  description: string;
  type: string;
  url: string;
  priority: number;
  is_active: boolean;
  is_default: boolean;
};

type StreamRow = {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category_id: string | null;
  thumbnail_url: string | null;
  hero_url: string | null;
  type: string;
  status: string;
  visibility: string;
  starts_at: string | null;
  ends_at: string | null;
  is_featured: boolean;
  is_active: boolean;
  viewers: number | null;
  created_at: string;
  stream_sources?: SourceRow[] | null;
  categories?: { group: string } | null;
};

/* -------------------------------- mappers -------------------------------- */

export const mapCategory = (row: CategoryRow): Category => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  group: row.group,
  icon: row.icon,
  color: row.color,
  imageUrl: row.image_url ?? null,
  sortOrder: row.sort_order,
  isActive: row.is_active,
});

const mapSource = (row: SourceRow): StreamSource => ({
  id: row.id,
  name: row.name,
  description: row.description,
  type: row.type as StreamSource["type"],
  url: row.url,
  priority: row.priority,
  isActive: row.is_active,
  isDefault: row.is_default,
});

export const mapStream = (row: StreamRow): Stream => {
  const placeholder = fallbackImageFor(row.categories?.group ?? null, row.type);
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.short_description,
    description: row.description,
    categoryId: row.category_id ?? "",
    thumbnailUrl: row.thumbnail_url || placeholder,
    heroUrl: row.hero_url || row.thumbnail_url || placeholder,
    type: row.type as StreamType,
    status: row.status as StreamStatus,
    visibility: row.visibility as Visibility,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    isFeatured: row.is_featured,
    isActive: row.is_active,
    viewers: row.viewers,
    sources: (row.stream_sources ?? [])
      .slice()
      .sort((a, b) => a.priority - b.priority)
      .map(mapSource),
    createdAt: row.created_at,
  };
};

const STREAM_SELECT = "*, stream_sources(*), categories(group)";

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

/* ------------------------------- categories ------------------------------- */

export async function fetchCategories(includeInactive = false): Promise<Category[]> {
  let query = supabase.from("categories").select("*").order("sort_order");
  if (!includeInactive) query = query.eq("is_active", true);
  const rows = unwrap(await query);
  return (rows as unknown as CategoryRow[]).map(mapCategory);
}

export type CategoryInput = Omit<Category, "id">;

export async function createCategory(input: CategoryInput) {
  unwrap(
    await sb.from("categories").insert({
      name: input.name,
      slug: input.slug,
      description: input.description,
      group: input.group,
      icon: input.icon,
      color: input.color,
      image_url: input.imageUrl,
      sort_order: input.sortOrder,
      is_active: input.isActive,
    }).select().single(),
  );
}

export async function updateCategory(id: string, input: Partial<CategoryInput>) {
  unwrap(
    await sb
      .from("categories")
      .update({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.group !== undefined && { group: input.group }),
        ...(input.icon !== undefined && { icon: input.icon }),
        ...(input.color !== undefined && { color: input.color }),
        ...(input.imageUrl !== undefined && { image_url: input.imageUrl }),
        ...(input.sortOrder !== undefined && { sort_order: input.sortOrder }),
        ...(input.isActive !== undefined && { is_active: input.isActive }),
      })
      .eq("id", id)
      .select()
      .single(),
  );
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* --------------------------------- streams -------------------------------- */

export async function fetchStreams(options?: { includeHidden?: boolean }): Promise<Stream[]> {
  let query = supabase.from("streams").select(STREAM_SELECT).order("starts_at", { ascending: true });
  if (!options?.includeHidden) query = query.eq("is_active", true);
  const rows = unwrap(await query);
  return (rows as unknown as StreamRow[]).map(mapStream);
}

export async function fetchStreamBySlug(slug: string): Promise<Stream | null> {
  const { data, error } = await supabase
    .from("streams")
    .select(STREAM_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapStream(data as unknown as StreamRow) : null;
}

export interface StreamInput {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string | null;
  thumbnailUrl: string | null;
  heroUrl: string | null;
  type: StreamType;
  status: StreamStatus;
  visibility: Visibility;
  startsAt: string | null;
  endsAt: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sources: Array<Omit<StreamSource, "id"> & { id?: string }>;
}

const streamPayload = (input: StreamInput) => ({
  title: input.title,
  slug: input.slug,
  short_description: input.shortDescription,
  description: input.description,
  category_id: input.categoryId,
  thumbnail_url: input.thumbnailUrl,
  hero_url: input.heroUrl,
  type: input.type,
  status: input.status,
  visibility: input.visibility,
  starts_at: input.startsAt,
  ends_at: input.endsAt,
  is_featured: input.isFeatured,
  is_active: input.isActive,
});

async function replaceSources(streamId: string, sources: StreamInput["sources"]) {
  const { error: delError } = await supabase
    .from("stream_sources")
    .delete()
    .eq("stream_id", streamId);
  if (delError) throw new Error(delError.message);
  const usable = sources.filter((source) => source.url.trim().length > 0);
  if (usable.length === 0) return;
  const { error } = await supabase.from("stream_sources").insert(
    usable.map((source, index) => ({
      stream_id: streamId,
      name: source.name || `Stream ${index + 1}`,
      description: source.description,
      type: source.type,
      url: source.url.trim(),
      priority: source.priority || index + 1,
      is_active: source.isActive,
      is_default: source.isDefault,
    })),
  );
  if (error) throw new Error(error.message);
}

export async function createStream(input: StreamInput): Promise<string> {
  const row = unwrap(await supabase.from("streams").insert(streamPayload(input)).select("id").single());
  if (!row) throw new Error("Failed to create stream");
  const id = (row as { id: string }).id;
  await replaceSources(id, input.sources);
  return id;
}

export async function updateStream(id: string, input: StreamInput) {
  unwrap(await supabase.from("streams").update(streamPayload(input)).eq("id", id).select("id").single());
  await replaceSources(id, input.sources);
}

export async function deleteStream(id: string) {
  const { error } = await supabase.from("streams").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function duplicateStream(stream: Stream) {
  const suffix = Math.random().toString(36).slice(2, 6);
  return createStream({
    title: `${stream.title} (copy)`,
    slug: `${stream.slug}-copy-${suffix}`,
    shortDescription: stream.shortDescription,
    description: stream.description,
    categoryId: stream.categoryId || null,
    thumbnailUrl: null,
    heroUrl: null,
    type: stream.type,
    status: "draft",
    visibility: stream.visibility,
    startsAt: stream.startsAt,
    endsAt: stream.endsAt,
    isFeatured: false,
    isActive: false,
    sources: stream.sources.map(({ id: _id, ...rest }) => rest),
  });
}

/* -------------------------------- settings -------------------------------- */

export async function fetchSettings(): Promise<SiteSettings> {
  const { data, error } = await sb.from("site_settings").select("*").limit(1).maybeSingle();
  if (error) throw new Error(error.message);
  const row = data as unknown as {
    site_name: string;
    site_description: string;
    timezone: string;
    registration_enabled: boolean;
    copyright_text: string;
    footer_cta_text: string;
    footer_cta_label: string;
    footer_cta_url: string;
    telegram_username: string;
    logo_url: string | null;
    favicon_url: string | null;
    homepage_order: string[] | null;
  } | null;
  return {
    siteName: row?.site_name ?? "PLive",
    siteDescription: row?.site_description ?? "Live sports streaming",
    timezone: row?.timezone ?? "UTC",
    registrationEnabled: row?.registration_enabled ?? true,
    copyrightText: row?.copyright_text ?? "© PLive. All rights reserved.",
    footerCtaText: row?.footer_cta_text ?? "",
    footerCtaLabel: row?.footer_cta_label ?? "",
    footerCtaUrl: row?.footer_cta_url ?? "#",
    telegramUsername: row?.telegram_username ?? "",
    logoUrl: row?.logo_url ?? null,
    faviconUrl: row?.favicon_url ?? null,
    homepageOrder: row?.homepage_order ?? ["hero", "categories", "online", "featured", "channels"],
  };
}

export async function updateSettings(input: SiteSettings) {
  unwrap(
    await sb
      .from("site_settings")
      .update({
        site_name: input.siteName,
        site_description: input.siteDescription,
        timezone: input.timezone,
        registration_enabled: input.registrationEnabled,
        copyright_text: input.copyrightText,
        footer_cta_text: input.footerCtaText,
        footer_cta_label: input.footerCtaLabel,
        footer_cta_url: input.footerCtaUrl,
        telegram_username: input.telegramUsername,
        logo_url: input.logoUrl,
        favicon_url: input.faviconUrl,
        homepage_order: input.homepageOrder,
      })
      .eq("id", true)
      .select()
      .single(),
  );
}

/* ---------------------------------- users --------------------------------- */

export async function fetchUsers(): Promise<AppUser[]> {
  const profiles = unwrap(
    await supabase.from("profiles").select("*").order("created_at", { ascending: false }),
  ) as unknown as Array<{
    id: string;
    display_name: string;
    email: string;
    avatar_url: string | null;
    status: string;
    created_at: string;
  }>;
  const roles = unwrap(await supabase.from("user_roles").select("user_id, role")) as unknown as Array<{
    user_id: string;
    role: string;
  }>;
  const adminIds = new Set(roles.filter((r) => r.role === "admin").map((r) => r.user_id));
  return profiles.map((profile) => ({
    id: profile.id,
    displayName: profile.display_name || profile.email,
    email: profile.email,
    role: (adminIds.has(profile.id) ? "admin" : "user") as UserRole,
    status: (profile.status === "suspended" ? "suspended" : "active") as UserStatus,
    avatarUrl: profile.avatar_url,
    joinedAt: profile.created_at,
  }));
}

export async function setUserStatus(userId: string, status: UserStatus) {
  unwrap(await supabase.from("profiles").update({ status }).eq("id", userId).select("id").single());
}

export async function setUserRole(userId: string, role: UserRole) {
  if (role === "admin") {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "admin");
    if (error) throw new Error(error.message);
  }
}

/* -------------------------------- uploads --------------------------------- */

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export async function uploadStreamImage(file: File): Promise<string> {
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  const { error } = await supabase.storage.from("stream-images").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data, error: signError } = await supabase.storage
    .from("stream-images")
    .createSignedUrl(path, TEN_YEARS);
  if (signError || !data) throw new Error(signError?.message ?? "Could not create image link");
  return data.signedUrl;
}

export async function uploadCategoryImage(file: File): Promise<string> {
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `categories/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  const { error } = await supabase.storage.from("stream-images").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data, error: signError } = await supabase.storage
    .from("stream-images")
    .createSignedUrl(path, TEN_YEARS);
  if (signError || !data) throw new Error(signError?.message ?? "Could not create image link");
  return data.signedUrl;
}

/* ------------------------------- watch history ------------------------------- */

const sb = supabase as unknown as { from: (table: string) => any };

export async function recordWatch(streamId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await sb
    .from("watch_history")
    .upsert({ user_id: user.id, stream_id: streamId }, { onConflict: "user_id,stream_id" });
  if (error) throw new Error(error.message);
}

export async function fetchWatchHistory(): Promise<Stream[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const rows = unwrap(
    await sb
      .from("watch_history")
      .select("stream_id, watched_at, streams!inner(*, stream_sources(*), categories(group))")
      .eq("user_id", user.id)
      .order("watched_at", { ascending: false })
      .limit(10),
  ) as unknown as Array<{
    stream_id: string;
    watched_at: string;
    streams: StreamRow;
  }>;
  return rows.map((r) => mapStream({ ...r.streams, stream_sources: r.streams.stream_sources ?? [] }));
}

/* --------------------------------- favorites --------------------------------- */

export async function toggleFavorite(streamId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existing } = await sb
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("stream_id", streamId)
    .maybeSingle();

  if (existing) {
    const { error } = await sb.from("favorites").delete().eq("id", existing.id);
    if (error) throw new Error(error.message);
    return false;
  } else {
    const { error } = await sb.from("favorites").insert({ user_id: user.id, stream_id: streamId });
    if (error) throw new Error(error.message);
    return true;
  }
}

export async function fetchFavoriteIds(): Promise<Set<string>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();
  const rows = unwrap(
    await sb.from("favorites").select("stream_id").eq("user_id", user.id),
  ) as unknown as Array<{ stream_id: string }>;
  return new Set(rows.map((r) => r.stream_id));
}

export async function fetchFavorites(): Promise<Stream[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const rows = unwrap(
    await sb
      .from("favorites")
      .select("stream_id, streams!inner(*, stream_sources(*), categories(group))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ) as unknown as Array<{
    stream_id: string;
    streams: StreamRow;
  }>;
  return rows.map((r) => mapStream({ ...r.streams, stream_sources: r.streams.stream_sources ?? [] }));
}
