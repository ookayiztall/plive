import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Send, Radio } from "lucide-react";
import { fetchCategories, fetchSettings } from "@/lib/api";

export function Footer() {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
  });

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => fetchSettings(),
  });

  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <footer className="mt-16 border-t border-border bg-surface/40">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <Radio className="size-4" aria-hidden />
          </span>
          <span className="font-display text-xl font-bold tracking-wide">PLive</span>
        </div>

        <div className="mt-8 grid gap-10 border-t border-border pt-8 lg:grid-cols-[1fr_2fr]">
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold tracking-wide uppercase">Browse</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/" className="hover:text-foreground">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/live" className="hover:text-foreground">
                    Live
                  </Link>
                </li>
                <li>
                  <Link to="/schedule" className="hover:text-foreground">
                    Schedule
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide uppercase">Account</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/login" className="hover:text-foreground">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-foreground">
                    Register
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:text-foreground">
                    Profile
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-center text-sm font-semibold tracking-wide uppercase">
              Available Championships
            </h2>
            <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-2.5 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
              {sortedCategories.map((category) => (
                <li key={category.id}>
                  <Link
                    to="/category/$slug"
                    params={{ slug: category.slug }}
                    className="hover:text-foreground"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-8 text-center">
          <p className="text-sm font-semibold">{settings?.footerCtaText}</p>
          {settings?.footerCtaLabel && (
            <a
              href={settings.footerCtaUrl}
              className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-semibold text-info hover:underline"
            >
              {settings.footerCtaLabel}
              <Send className="size-3.5" aria-hidden />
            </a>
          )}
          <p className="mt-6 text-xs text-muted-foreground">{settings?.copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
