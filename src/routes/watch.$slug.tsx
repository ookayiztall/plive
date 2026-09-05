import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { RotateCw, Users, Send, Heart } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer, SectionHeader } from "@/components/layout/PageContainer";
import { VideoPlayer } from "@/components/watch/VideoPlayer";
import { ServerSelector } from "@/components/watch/ServerSelector";
import { StreamCard } from "@/components/streams/StreamCard";
import { EventCarousel } from "@/components/streams/EventCarousel";
import { EmptyState } from "@/components/common/EmptyState";
import { WatchSkeleton } from "@/components/common/LoadingSkeleton";
import { Pill } from "@/components/common/badges";
import { Countdown } from "@/components/common/Countdown";
import { Button } from "@/components/ui/button";
import {
  fetchStreamBySlug, fetchStreams, fetchCategories,
  recordWatch, toggleFavorite, fetchFavoriteIds,
} from "@/lib/api";
import { formatDateTime, statusLabel } from "@/lib/format";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/watch/$slug")({
  head: () => ({
    meta: [
      { title: "Stream — PLive" },
      { name: "description", content: "Watch live sport on PLive." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WatchPage,
});

function WatchNotFound() {
  return (
    <AppLayout>
      <PageContainer className="py-20">
        <EmptyState
          title="Stream unavailable"
          description="This stream doesn't exist or has been removed."
          action={
            <Button asChild>
              <Link to="/live">Browse live streams</Link>
            </Button>
          }
        />
      </PageContainer>
    </AppLayout>
  );
}

function WatchPage() {
  const { slug } = Route.useParams();
  const { user } = useSession();
  const queryClient = useQueryClient();

  const { data: stream, isLoading: streamLoading } = useQuery({
    queryKey: ["stream", slug],
    queryFn: () => fetchStreamBySlug(slug),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
  });

  const { data: allStreams = [] } = useQuery({
    queryKey: ["streams"],
    queryFn: () => fetchStreams(),
  });

  const { data: favoriteIds = new Set<string>() } = useQuery({
    queryKey: ["favoriteIds"],
    queryFn: fetchFavoriteIds,
    enabled: !!user,
  });

  const [selectedSource, setSelectedSource] = useState("");

  const category = categories.find((c) => c.id === stream?.categoryId);
  const sources = stream?.sources.filter((source) => source.isActive) ?? [];

  useEffect(() => {
    if (stream && selectedSource === "") {
      const defaultId = stream.sources.filter((s) => s.isActive).find((s) => s.isDefault)?.id
        ?? stream.sources.filter((s) => s.isActive)[0]?.id
        ?? "";
      if (defaultId) setSelectedSource(defaultId);
    }
  }, [stream, selectedSource]);

  // Record watch history
  useEffect(() => {
    if (stream && user) {
      recordWatch(stream.id).catch(() => {});
    }
  }, [stream?.id, user]);

  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavorite(stream!.id),
    onSuccess: (isFav) => {
      queryClient.invalidateQueries({ queryKey: ["favoriteIds"] });
      toast.success(isFav ? "Added to favorites" : "Removed from favorites");
    },
  });

  const isLive = stream?.status === "live";
  const isFavorited = stream ? favoriteIds.has(stream.id) : false;

  const related = stream
    ? allStreams
        .filter((item) => item.categoryId === stream.categoryId && item.id !== stream.id)
        .slice(0, 8)
    : [];

  if (streamLoading) {
    return (
      <AppLayout>
        <PageContainer className="py-6">
          <WatchSkeleton />
        </PageContainer>
      </AppLayout>
    );
  }

  if (!stream) return <WatchNotFound />;

  return (
    <AppLayout>
      <PageContainer className="py-6">
        <VideoPlayer
          posterUrl={stream.heroUrl}
          title={stream.title}
          isLive={isLive}
          streamUrl={sources.find((s) => s.id === selectedSource)?.url ?? null}
        />

        <div className="mt-6 border-b border-border pb-8">
          <h1 className="text-2xl font-bold tracking-tight uppercase sm:text-3xl">
            {stream.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{stream.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {category && <Pill>{category.name}</Pill>}
            <Pill>{stream.type === "channel" ? "24/7 Live" : statusLabel(stream)}</Pill>
            {stream.visibility === "registered" && <Pill>Registered users</Pill>}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {isLive ? (
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-live">
                <span className="live-dot" /> Live now
              </span>
            ) : (
              <span className="flex items-center gap-3 text-sm text-muted-foreground">
                Starts {formatDateTime(stream.startsAt)}
                <Countdown targetIso={stream.startsAt} />
              </span>
            )}
            {stream.viewers !== null && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
                <Users className="size-3.5" aria-hidden />
                {stream.viewers} watching
              </span>
            )}
            {user && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => favoriteMutation.mutate()}
                disabled={favoriteMutation.isPending}
              >
                <Heart
                  className={cn("size-4", isFavorited && "fill-destructive text-destructive")}
                  aria-hidden
                />
                {isFavorited ? "Favorited" : "Favorite"}
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => setSelectedSource(sources.find((s) => s.id !== selectedSource)?.id ?? selectedSource)}>
              <RotateCw className="size-4" aria-hidden /> Reload stream
            </Button>
          </div>
        </div>

        <section className="mt-8 space-y-4">
          <SectionHeader
            title="Choose a server"
            subtitle="If playback stops, switch to another source."
          />
          {sources.length === 0 ? (
            <EmptyState title="No sources available" description="This stream has no active sources." />
          ) : (
            <ServerSelector
              sources={sources}
              selectedId={selectedSource}
              onSelect={setSelectedSource}
            />
          )}
        </section>

        <section className="mt-8 overflow-hidden rounded-lg border border-border bg-surface p-5">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="min-w-0">
              <p className="text-[11px] font-bold tracking-widest text-info uppercase">
                PLive signal buddy
              </p>
              <h2 className="mt-1 text-lg font-bold">Join us on Telegram</h2>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>· Technical support</li>
                <li>· Stream requests</li>
              </ul>
            </div>
            <Button variant="secondary" className="w-full sm:w-auto">
              <Send className="size-4" aria-hidden /> Open Telegram
            </Button>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-10 space-y-3">
            <SectionHeader title="More from this category" />
            <EventCarousel controlsLabel="related events">
              {related.map((item) => (
                <StreamCard key={item.id} stream={item} />
              ))}
            </EventCarousel>
          </section>
        )}
      </PageContainer>
    </AppLayout>
  );
}
