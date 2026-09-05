import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, LogOut, User, LayoutDashboard, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "@/lib/session";
import { fetchSettings } from "@/lib/api";
import { cn } from "@/lib/utils";

const SETTINGS_CACHE_KEY = "plive_settings_cache";

function getCachedSettings(): { logoUrl?: string; faviconUrl?: string; siteName?: string } {
  try {
    const raw = localStorage.getItem(SETTINGS_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function cacheSettings(data: { logoUrl?: string; faviconUrl?: string; siteName?: string }) {
  try {
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(data));
  } catch { /* noop */ }
}

const navItems = [
  { label: "Home", to: "/" as const },
  { label: "Live", to: "/live" as const },
  { label: "Schedule", to: "/schedule" as const },
];

function Logo() {
  const cached = getCachedSettings();
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const logoUrl = settings?.logoUrl ?? cached.logoUrl ?? null;
  const siteName = settings?.siteName ?? cached.siteName ?? "PLive";

  return (
    <Link to="/" className="flex items-center gap-2">
      {logoUrl ? (
        <img src={logoUrl} alt={siteName} className="h-8 w-auto object-contain" />
      ) : (
        <>
          <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <Radio className="size-4" aria-hidden />
          </span>
          <span className="font-display text-xl font-bold tracking-wide">{siteName}</span>
        </>
      )}
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useSession();
  const cached = getCachedSettings();
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  // Cache settings for instant load on next refresh
  useEffect(() => {
    if (settings) {
      const cache: { logoUrl?: string; faviconUrl?: string; siteName?: string } = {};
      if (settings.logoUrl) cache.logoUrl = settings.logoUrl;
      if (settings.faviconUrl) cache.faviconUrl = settings.faviconUrl;
      cache.siteName = settings.siteName;
      cacheSettings(cache);
    }
  }, [settings]);

  // Apply favicon immediately from cache, then update from API
  useEffect(() => {
    const faviconUrl = settings?.faviconUrl ?? cached.faviconUrl;
    if (faviconUrl) {
      let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = faviconUrl;
    }
  }, [settings?.faviconUrl, cached.faviconUrl]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto grid h-16 w-full max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-primary" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="text-sm font-medium transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div />

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md border border-border bg-surface px-2 py-1.5 transition-colors hover:bg-surface-2"
                >
                  <Avatar className="size-7">
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                      {user.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-28 truncate text-sm font-medium sm:block">
                    {user.displayName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="size-4" aria-hidden /> Profile
                  </Link>
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <LayoutDashboard className="size-4" aria-hidden /> Admin dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={signOut}>
                  <LogOut className="size-4" aria-hidden /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-md border border-border bg-surface md:hidden"
          >
            {open ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border transition-all md:hidden",
          open ? "max-h-96" : "max-h-0 border-t-0",
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "bg-surface-2 text-primary" }}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground"
            >
              {item.label}
            </Link>
          ))}
          {!user && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button asChild variant="outline" size="sm" onClick={() => setOpen(false)}>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm" onClick={() => setOpen(false)}>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>

    </header>
  );
}
