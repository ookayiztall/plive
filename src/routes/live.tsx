import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Tv, SearchX } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer, SectionHeader } from "@/components/layout/PageContainer";
import { StreamCard } from "@/components/streams/StreamCard";
import { SearchInput } from "@/components/common/SearchInput";
import { FilterBar } from "@/components/common/FilterBar";
import { EmptyState } from "@/components/common/EmptyState";
import { CardGridSkeleton } from "@/components/common/LoadingSkeleton";
import { fetchStreams, fetchCategories } from "@/lib/api";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live Now — Every Match Streaming on PLive" },
      {
        name: "description",
        content:
          "Browse every sports stream that is live right now on PLive, filtered by league, competition or channel.",
      },
      { property: "og:title", content: "Live Now — PLive" },
      { property: "og:description", content: "Every sports stream that is live right now." },
    ],
  }),
  component: LivePage,
});

function LivePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const { data: streams = [], isLoading } = useQuery({
    queryKey: ["streams"],
    queryFn: () => fetchStreams(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
  });

  const live = useMemo(() => streams.filter((s) => s.status === "live"), [streams]);

  const filterOptions = useMemo(
    () => [
      { label: "All", value: "all" },
      ...categories
        .filter((c) => live.some((stream) => stream.categoryId === c.id))
        .map((c) => ({ label: c.name, value: c.id })),
    ],
    [live, categories],
  );

  const results = live.filter((stream) => {
    const matchesCategory = category === "all" || stream.categoryId === category;
    const matchesQuery = stream.title.toLowerCase().includes(query.trim().toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <AppLayout>
      <PageContainer className="py-8">
        <SectionHeader
          title="Live Now"
          subtitle="Every match, fight and channel currently streaming on PLive."
        />

        <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-center">
          <SearchInput value={query} onChange={setQuery} placeholder="Search live streams…" />
          <FilterBar
            options={filterOptions}
            value={category}
            onChange={setCategory}
            ariaLabel="Filter live streams by category"
          />
        </div>

        <div className="mt-8">
          {isLoading ? (
            <CardGridSkeleton count={8} />
          ) : live.length === 0 ? (
            <EmptyState
              icon={Tv}
              title="No live events right now"
              description="Nothing is streaming at this moment. Check the schedule for upcoming fixtures."
            />
          ) : results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No results found"
              description="Try a different search term or clear the category filter."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          )}
        </div>
      </PageContainer>
    </AppLayout>
  );
}
