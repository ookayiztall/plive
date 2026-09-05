import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StreamForm } from "@/components/admin/StreamForm";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { fetchStreams } from "@/lib/api";

export const Route = createFileRoute("/admin/streams/$id/edit")({
  loader: async ({ params }) => {
    return { streamId: params.id };
  },
  head: () => ({
    meta: [
      { title: "Edit Stream — PLive Admin" },
      { name: "description", content: "Edit stream details, schedule and sources." },
      { property: "og:title", content: "Edit Stream — PLive Admin" },
      { property: "og:description", content: "Edit stream details, schedule and sources." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditStreamPage,
  notFoundComponent: EditStreamNotFound,
});

function EditStreamNotFound() {
  return (
    <AdminLayout title="Stream not found">
      <EmptyState
        title="Stream not found"
        description="This stream no longer exists."
        action={
          <Button asChild>
            <Link to="/admin/streams">Back to streams</Link>
          </Button>
        }
      />
    </AdminLayout>
  );
}

function EditStreamPage() {
  const { streamId } = Route.useLoaderData();

  const { data: streams = [], isLoading } = useQuery({
    queryKey: ["streams", { includeHidden: true }],
    queryFn: () => fetchStreams({ includeHidden: true }),
  });

  const stream = streams.find((s) => s.id === streamId);

  if (isLoading) {
    return (
      <AdminLayout title="Edit stream">
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-surface-2" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  if (!stream) return <EditStreamNotFound />;

  return (
    <AdminLayout title="Edit stream" description={stream.title}>
      <StreamForm stream={stream} />
    </AdminLayout>
  );
}
