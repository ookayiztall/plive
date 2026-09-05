import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { History, Star, ShieldAlert } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer, SectionHeader } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/common/EmptyState";
import { StreamCard } from "@/components/streams/StreamCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/common/badges";
import { useSession } from "@/lib/session";
import { fetchWatchHistory, fetchFavorites } from "@/lib/api";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — PLive Account" },
      { name: "description", content: "Manage your PLive account details and viewing activity." },
      { property: "og:title", content: "Your Profile — PLive" },
      { property: "og:description", content: "Manage your PLive account details." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useSession();

  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ["watchHistory"],
    queryFn: fetchWatchHistory,
    enabled: !!user,
  });

  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: fetchFavorites,
    enabled: !!user,
  });

  if (!user) {
    return (
      <AppLayout>
        <PageContainer className="py-20">
          <EmptyState
            icon={ShieldAlert}
            title="Unauthorized access"
            description="You need to be signed in to view your profile."
            action={
              <Button asChild>
                <Link to="/login">Go to login</Link>
              </Button>
            }
          />
        </PageContainer>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageContainer className="py-8">
        <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-lg border border-border bg-surface p-6">
          <Avatar className="size-16 shrink-0">
            <AvatarFallback className="bg-primary text-lg text-primary-foreground">
              {user.displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight">{user.displayName}</h1>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Pill>{user.role === "admin" ? "Administrator" : "Member"}</Pill>
              <Pill>Joined {new Date(user.joinedAt).toLocaleDateString()}</Pill>
            </div>
          </div>
        </header>

        <section className="mt-8 space-y-4">
          <SectionHeader title="Account information" />
          <dl className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            {[
              { label: "Display name", value: user.displayName },
              { label: "Email", value: user.email },
              { label: "Role", value: user.role },
              { label: "Status", value: user.status },
            ].map((row) => (
              <div key={row.label} className="bg-surface p-4">
                <dt className="text-xs tracking-wide text-muted-foreground uppercase">
                  {row.label}
                </dt>
                <dd className="mt-1 truncate text-sm font-medium capitalize">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10 space-y-4">
          <SectionHeader title="Recently watched" />
          {historyLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-lg border border-border bg-surface" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <EmptyState
              icon={History}
              title="Nothing watched yet"
              description="Streams you watch will appear here."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {history.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-10 space-y-4">
          <SectionHeader title="Favorite streams" />
          {favoritesLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-lg border border-border bg-surface" />
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No favorites saved"
              description="Save a stream to find it quickly next time."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          )}
        </section>
      </PageContainer>
    </AppLayout>
  );
}
