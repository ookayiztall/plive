/**
 * Domain types. These mirror the shape a real backend (Supabase) would return,
 * so mock data can be swapped for real queries without touching components.
 */

export type StreamStatus = "draft" | "scheduled" | "live" | "ended" | "offline";
export type StreamType = "event" | "channel";
export type Visibility = "public" | "registered";
export type UserRole = "user" | "admin";
export type UserStatus = "active" | "suspended";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  group: string;
  icon: string;
  color: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface StreamSource {
  id: string;
  name: string;
  description: string;
  type: "hls" | "m3u8" | "iframe";
  url: string;
  priority: number;
  isActive: boolean;
  isDefault: boolean;
}

export interface Stream {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  thumbnailUrl: string;
  heroUrl: string;
  type: StreamType;
  status: StreamStatus;
  visibility: Visibility;
  startsAt: string | null;
  endsAt: string | null;
  isFeatured: boolean;
  isActive: boolean;
  viewers: number | null;
  sources: StreamSource[];
  createdAt: string;
}

export interface FeaturedSlide {
  id: string;
  title: string;
  description: string;
  badge: string;
  imageUrl: string;
  streamSlug: string;
  isLive: boolean;
}

export interface AppUser {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl: string | null;
  joinedAt: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  timezone: string;
  registrationEnabled: boolean;
  copyrightText: string;
  footerCtaText: string;
  footerCtaLabel: string;
  footerCtaUrl: string;
  telegramUsername: string;
  logoUrl: string | null;
  faviconUrl: string | null;
}
