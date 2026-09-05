import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Tv, CalendarClock, Radio } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer, SectionHeader } from "@/components/layout/PageContainer";
import { StreamCard } from "@/components/streams/StreamCard";
import { ChannelCard } from "@/components/streams/ChannelCard";
import { EmptyState } from "@/components/common/EmptyState";
import { CardGridSkeleton } from "@/components/common/LoadingSkeleton";
import { Pill } from "@/components/common/badges";
import { Button } from "@/components/ui/button";
import { fetchCategories, fetchStreams } from "@/lib/api";

export const Route = createFileRoute("/category/$slug")({
  head: () => ({
    meta: [
      { title: "Category — PLive" },
      { name: "description", content: "Browse streams by category on PLive." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CategoryPage,
});

function CategoryNotFound() {
  return (
    <AppLayout>
      <PageContainer className="py-20">
        <EmptyState
          title="Category not found"
          description="This competition doesn't exist or is no longer available."
          action={
            <Button asChild>
              <Link to="/">Back to home</Link>
            </Button>
          }
        />
      </PageContainer>
    </AppLayout>
  );
}

function CategoryPage() {
  const { slug: categorySlug } = Route.useParams();

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
  });

  const { data: streams = [], isLoading: streamsLoading } = useQuery({
    queryKey: ["streams"],
    queryFn: () => fetchStreams(),
  });

  const isLoading = categoriesLoading || streamsLoading;
  const category = categories.find((c) => c.slug === categorySlug);

  if (!category && !isLoading) {
    return <CategoryNotFound />;
  }

  if (!category) return null;

  const categoryStreams = streams.filter((s) => s.categoryId === category.id);
  const live = categoryStreams.filter((s) => s.status === "live" && s.type === "event");
  const upcoming = categoryStreams.filter((s) => s.status === "scheduled");
  const channels = categoryStreams.filter((s) => s.type === "channel");

  return (
    <AppLayout>
      <PageContainer className="py-8">
        <header className="rounded-lg border border-border bg-surface p-6">
          <div className="flex min-w-0 items-center gap-4">
            <span
              className="grid size-12 shrink-0 place-items-center rounded-lg text-lg font-bold"
              style={{
                backgroundColor: `color-mix(in oklab, ${category.color} 22%, transparent)`,
                color: category.color,
              }}
              aria-hidden
            >
              {category.name.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
                {category.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Pill>{category.group}</Pill>
            <Pill>{categoryStreams.length} streams</Pill>
            {live.length > 0 && <Pill className="text-live">{live.length} live now</Pill>}
          </div>
        </header>

        <section className="mt-10 space-y-4">
          <SectionHeader title="Live Now" />
          {isLoading ? (
            <CardGridSkeleton count={4} />
          ) : live.length === 0 ? (
            <EmptyState icon={Tv} title="No live events right now" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {live.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-12 space-y-4">
          <SectionHeader title="Upcoming Events" />
          {isLoading ? (
            <CardGridSkeleton count={4} />
          ) : upcoming.length === 0 ? (
            <EmptyState icon={CalendarClock} title="No upcoming streams" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {upcoming.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-12 space-y-4">
          <SectionHeader title="24/7 Channels" />
          {isLoading ? (
            <CardGridSkeleton count={4} />
          ) : channels.length === 0 ? (
            <EmptyState icon={Radio} title="No channels in this category" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {channels.map((stream) => (
                <ChannelCard key={stream.id} stream={stream} />
              ))}
            </div>
          )}
        </section>
      </PageContainer>
    </AppLayout>
  );
}
