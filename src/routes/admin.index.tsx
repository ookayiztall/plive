import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Radio, CalendarClock, Layers, Tags } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/common/badges";
import { fetchStreams, fetchCategories, fetchUsers } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — PLive Control Panel" },
      { name: "description", content: "Overview of PLive streams, categories and users." },
      { property: "og:title", content: "Admin Dashboard — PLive" },
      { property: "og:description", content: "Overview of streams, categories and users." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: streams = [] } = useQuery({
    queryKey: ["streams", { includeHidden: true }],
    queryFn: () => fetchStreams({ includeHidden: true }),
    refetchInterval: 10000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", { includeInactive: true }],
    queryFn: () => fetchCategories(true),
    refetchInterval: 30000,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchUsers(),
    refetchInterval: 30000,
  });

  const liveStreams = streams.filter((s) => s.status === "live");
  const upcomingStreams = streams
    .filter((s) => s.status === "scheduled")
    .sort((a, b) => (a.startsAt ?? "").localeCompare(b.startsAt ?? ""));

  const stats = [
    { label: "Total Users", value: users.length, icon: Users },
    { label: "Live Streams", value: liveStreams.length, icon: Radio },
    { label: "Scheduled Streams", value: upcomingStreams.length, icon: CalendarClock },
    { label: "Total Streams", value: streams.length, icon: Layers },
    { label: "Active Categories", value: categories.filter((c) => c.isActive).length, icon: Tags },
  ];

  const upcoming = upcomingStreams.slice(0, 5);
  const recent = [...streams]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <AdminLayout title="Dashboard" description="Platform overview.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">{stat.label}</p>
              <stat.icon className="size-4 shrink-0 text-primary" aria-hidden />
            </div>
            <p className="mt-3 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold tracking-wide uppercase">Upcoming streams</h2>
          <ul className="mt-3 divide-y divide-border">
            {upcoming.map((stream) => (
              <li key={stream.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Link
                    to="/admin/streams/$id/edit"
                    params={{ id: stream.id }}
                    className="block truncate text-sm font-medium hover:text-primary"
                  >
                    {stream.title}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatDateTime(stream.startsAt)}
                  </p>
                </div>
                <StatusBadge stream={stream} />
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold tracking-wide uppercase">Recently created</h2>
          <ul className="mt-3 divide-y divide-border">
            {recent.map((stream) => (
              <li key={stream.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{stream.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {stream.type === "channel" ? "24/7 channel" : "Scheduled event"}
                  </p>
                </div>
                <StatusBadge stream={stream} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminLayout>
  );
}
