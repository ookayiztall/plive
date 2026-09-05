import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Tv } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer, SectionHeader } from "@/components/layout/PageContainer";
import { HeroCarousel } from "@/components/streams/HeroCarousel";
import { CategoryCarousel } from "@/components/streams/CategoryCarousel";
import { StreamCard } from "@/components/streams/StreamCard";
import { ChannelCard } from "@/components/streams/ChannelCard";
import { EventSection } from "@/components/streams/EventSection";
import { EventCarousel } from "@/components/streams/EventCarousel";
import { EmptyState } from "@/components/common/EmptyState";
import { CardGridSkeleton, HeroSkeleton, CategoryRowSkeleton } from "@/components/common/LoadingSkeleton";
import { fetchCategories } from "@/lib/api";
import { fetchStreams } from "@/lib/api";
import type { FeaturedSlide } from "@/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PLive — Live Sports Streaming, Fixtures & 24/7 Channels" },
      {
        name: "description",
        content:
          "Watch live football, combat sports and Formula 1 on PLive, with upcoming fixtures and always-on 24/7 sports channels.",
      },
      { property: "og:title", content: "PLive — Live Sports Streaming" },
      {
        property: "og:description",
        content: "Live matches, upcoming fixtures and 24/7 sports channels in one place.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
  });

  const { data: streams = [], isLoading: streamsLoading } = useQuery({
    queryKey: ["streams"],
    queryFn: () => fetchStreams(),
  });

  const isLoading = categoriesLoading || streamsLoading;

  const liveStreams = streams.filter((s) => s.status === "live" && s.type === "event");
  const upcoming = streams
    .filter((s) => s.status === "scheduled")
    .sort((a, b) => (a.startsAt ?? "").localeCompare(b.startsAt ?? ""));
  const channels = streams.filter((s) => s.type === "channel");

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  const featuredStreams = streams.filter((s) => s.isFeatured && s.isActive);
  const featuredSlides: FeaturedSlide[] = featuredStreams.slice(0, 5).map((stream) => ({
    id: stream.id,
    title: stream.title,
    description: stream.shortDescription,
    badge: getCategoryById(stream.categoryId)?.name ?? "Featured",
    imageUrl: stream.heroUrl,
    streamSlug: stream.slug,
    isLive: stream.status === "live",
  }));

  const groups = ["Football", "Combat Sports", "Formula 1", "Basketball"];
  const byGroup = groups.map((group) => ({
    group,
    streams: upcoming.filter(
      (stream) => getCategoryById(stream.categoryId)?.group === group,
    ),
  }));

  return (
    <AppLayout>
      <PageContainer className="py-6">
        {isLoading ? (
          <HeroSkeleton />
        ) : featuredSlides.length > 0 ? (
          <HeroCarousel slides={featuredSlides} />
        ) : null}
      </PageContainer>

      <PageContainer>
        {isLoading ? (
          <CategoryRowSkeleton />
        ) : (
          <CategoryCarousel categories={categories.filter((c) => c.isActive)} />
        )}
      </PageContainer>

      <PageContainer className="mt-12 space-y-4">
        <SectionHeader title="Online Now" subtitle="Live matches based on current match time" />
        {isLoading ? (
          <CardGridSkeleton count={4} />
        ) : liveStreams.length === 0 ? (
          <EmptyState
            icon={Tv}
            title="No live matches right now"
            description="Check the schedule for the next kick-off, or browse our 24/7 channels."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {liveStreams.map((stream) => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        )}
      </PageContainer>

      <PageContainer className="mt-14 space-y-8">
        <SectionHeader
          title="Featured Matches"
          subtitle="Important live and upcoming matches based on your active leagues"
        />
        {!isLoading &&
          byGroup
            .filter((entry) => entry.streams.length > 0)
            .map((entry) => (
              <EventSection key={entry.group} title={entry.group} streams={entry.streams} />
            ))}
      </PageContainer>

      <PageContainer className="mt-14 space-y-4">
        <SectionHeader title="24/7 Live" subtitle="Always-on streams available around the clock" />
        {isLoading ? (
          <CardGridSkeleton count={3} />
        ) : channels.length === 0 ? (
          <EmptyState icon={Tv} title="No channels available" />
        ) : (
          <EventCarousel controlsLabel="channels" itemClassName="w-[280px] sm:w-[320px]">
            {channels.map((channel) => (
              <ChannelCard key={channel.id} stream={channel} />
            ))}
          </EventCarousel>
        )}
      </PageContainer>
    </AppLayout>
  );
}
