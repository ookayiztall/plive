import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Radio,
  Tags,
  Users,
  Settings,
  Menu,
  X,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const items: Array<{ label: string; to: string; icon: LucideIcon; exact?: boolean }> = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Streams", to: "/admin/streams", icon: Radio },
  { label: "Categories", to: "/admin/categories", icon: Tags },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
        <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
          <Radio className="size-4" aria-hidden />
        </span>
        <span className="font-display text-lg font-bold tracking-wide">PLIVE ADMIN</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="size-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden /> Back to site
        </Link>
      </div>
    </div>
  );
}

export function AdminLayout({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { user } = useSession();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border lg:block">
        <div className="sticky top-0 h-screen">
          <AdminSidebar />
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-sidebar-border shadow-elevated">
            <AdminSidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            aria-label={open ? "Close admin menu" : "Open admin menu"}
            onClick={() => setOpen((v) => !v)}
            className="grid size-9 shrink-0 place-items-center rounded-md border border-border bg-surface lg:hidden"
          >
            {open ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
          </button>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">Admin panel</span>
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {(user?.displayName ?? "AD").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
              {description && (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {actions && <div className="shrink-0">{actions}</div>}
          </div>
          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
