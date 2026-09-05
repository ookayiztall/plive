import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer, SectionHeader } from "@/components/layout/PageContainer";
import { FilterBar } from "@/components/common/FilterBar";
import { SearchInput } from "@/components/common/SearchInput";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/badges";
import { Countdown } from "@/components/common/Countdown";
import { fetchStreams, fetchCategories } from "@/lib/api";
import { formatDay, formatTime, isSameDay } from "@/lib/format";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "Sports Schedule — Today, Tomorrow & Upcoming | PLive" },
      {
        name: "description",
        content:
          "Full PLive sports schedule with kick-off times, countdowns and status for every upcoming match, fight and race.",
      },
      { property: "og:title", content: "Sports Schedule — PLive" },
      {
        property: "og:description",
        content: "Kick-off times and countdowns for every upcoming event.",
      },
    ],
  }),
  component: SchedulePage,
});

const dayTabs = [
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "Upcoming", value: "upcoming" },
];

function SchedulePage() {
  const [tab, setTab] = useState("today");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const { data: streams = [], isLoading } = useQuery({
    queryKey: ["streams"],
    queryFn: () => fetchStreams(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
  });

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  const events = useMemo(
    () =>
      streams
        .filter((stream) => stream.type === "event" && stream.startsAt)
        .sort((a, b) => (a.startsAt ?? "").localeCompare(b.startsAt ?? "")),
    [streams],
  );

  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86_400_000);

  const results = events.filter((stream) => {
    const matchesTab =
      tab === "today"
        ? isSameDay(stream.startsAt, today)
        : tab === "tomorrow"
          ? isSameDay(stream.startsAt, tomorrow)
          : new Date(stream.startsAt ?? 0).getTime() > tomorrow.getTime();
    const matchesCategory = category === "all" || stream.categoryId === category;
    const matchesQuery = stream.title.toLowerCase().includes(query.trim().toLowerCase());
    return matchesTab && matchesCategory && matchesQuery;
  });

  const grouped = results.reduce<Record<string, typeof results>>((acc, stream) => {
    const key = formatDay(stream.startsAt);
    acc[key] = [...(acc[key] ?? []), stream];
    return acc;
  }, {});

  return (
    <AppLayout>
      <PageContainer className="py-8">
        <SectionHeader
          title="Schedule"
          subtitle="Kick-off times, countdowns and status for every scheduled event."
        />

        <div className="mt-6 space-y-3">
          <FilterBar options={dayTabs} value={tab} onChange={setTab} ariaLabel="Schedule day" />
          <div className="grid gap-3 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-center">
            <SearchInput value={query} onChange={setQuery} placeholder="Search events…" />
            <FilterBar
              options={[
                { label: "All sports", value: "all" },
                ...categories.map((c) => ({ label: c.name, value: c.id })),
              ]}
              value={category}
              onChange={setCategory}
              ariaLabel="Filter schedule by category"
            />
          </div>
        </div>

        <div className="mt-8 space-y-8">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-surface-2" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="No upcoming streams"
              description="There is nothing scheduled for this selection. Try another day or category."
            />
          ) : (
            Object.entries(grouped).map(([day, items]) => (
              <section key={day} className="space-y-3">
                <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                  {day}
                </h2>
                <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
                  {items.map((stream) => (
                    <li key={stream.id}>
                      <Link
                        to="/watch/$slug"
                        params={{ slug: stream.slug }}
                        className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 p-3 transition-colors hover:bg-surface-2 sm:grid-cols-[128px_minmax(0,1fr)_auto]"
                      >
                        <img
                          src={stream.thumbnailUrl}
                          alt={stream.title}
                          loading="lazy"
                          className="aspect-video w-24 rounded-md object-cover sm:w-32"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{stream.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {getCategoryById(stream.categoryId)?.name}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(stream.startsAt)}
                            </span>
                            <Countdown targetIso={stream.startsAt} />
                          </div>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <StatusBadge stream={stream} />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </PageContainer>
    </AppLayout>
  );
}
