import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StreamForm } from "@/components/admin/StreamForm";

export const Route = createFileRoute("/admin/streams/new")({
  head: () => ({
    meta: [
      { title: "Create Stream — PLive Admin" },
      { name: "description", content: "Create a new live event or 24/7 channel on PLive." },
      { property: "og:title", content: "Create Stream — PLive Admin" },
      { property: "og:description", content: "Create a new live event or 24/7 channel." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewStreamPage,
});

function NewStreamPage() {
  return (
    <AdminLayout title="Create stream" description="Add a new event or 24/7 channel.">
      <StreamForm />
    </AdminLayout>
  );
}
