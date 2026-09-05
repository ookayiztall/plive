import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, MoreHorizontal, SearchX } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { SearchInput } from "@/components/common/SearchInput";
import { FilterBar } from "@/components/common/FilterBar";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/badges";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchStreams, fetchCategories, deleteStream, duplicateStream } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { Stream } from "@/types";

export const Route = createFileRoute("/admin/streams/")({
  head: () => ({
    meta: [
      { title: "Stream Management — PLive Admin" },
      { name: "description", content: "Manage live, scheduled and 24/7 streams on PLive." },
      { property: "og:title", content: "Stream Management — PLive Admin" },
      { property: "og:description", content: "Manage live, scheduled and 24/7 streams." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminStreams,
});

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Live", value: "live" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Ended", value: "ended" },
  { label: "24/7", value: "channel" },
];

function AdminStreams() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: streams = [], isLoading } = useQuery({
    queryKey: ["streams", { includeHidden: true }],
    queryFn: () => fetchStreams({ includeHidden: true }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
  });

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);

  const deleteMutation = useMutation({
    mutationFn: deleteStream,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streams"] });
      toast.success("Stream deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const duplicateMutation = useMutation({
    mutationFn: duplicateStream,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streams"] });
      toast.success("Stream duplicated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const results = streams.filter((stream) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "channel"
          ? stream.type === "channel"
          : stream.status === filter;
    return matchesFilter && stream.title.toLowerCase().includes(query.trim().toLowerCase());
  });

  return (
    <AdminLayout
      title="Streams"
      description="Create, edit and organise every stream on the platform."
      actions={
        <Button asChild>
          <Link to="/admin/streams/new">
            <Plus className="size-4" aria-hidden /> New stream
          </Link>
        </Button>
      }
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-center">
        <SearchInput value={query} onChange={setQuery} placeholder="Search streams…" />
        <FilterBar
          options={statusFilters}
          value={filter}
          onChange={setFilter}
          ariaLabel="Filter streams by status"
        />
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-2" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No streams found"
            description="Adjust your search or filters to find what you're looking for."
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-lg border border-border bg-surface lg:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                  <tr>
                    <th className="p-3 font-medium">Thumbnail</th>
                    <th className="p-3 font-medium">Title</th>
                    <th className="p-3 font-medium">Category</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Start time</th>
                    <th className="p-3 font-medium">Featured</th>
                    <th className="p-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {results.map((stream) => (
                    <tr key={stream.id} className="hover:bg-surface-2/50">
                      <td className="p-3">
                        <img
                          src={stream.thumbnailUrl}
                          alt=""
                          loading="lazy"
                          className="aspect-video w-20 rounded object-cover"
                        />
                      </td>
                      <td className="max-w-[240px] p-3">
                        <span className="block truncate font-medium">{stream.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          /{stream.slug}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {getCategoryById(stream.categoryId)?.name}
                      </td>
                      <td className="p-3 text-muted-foreground capitalize">{stream.type}</td>
                      <td className="p-3">
                        <StatusBadge stream={stream} />
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {formatDateTime(stream.startsAt)}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {stream.isFeatured ? "Yes" : "—"}
                      </td>
                      <td className="p-3 text-right">
                        <RowActions
                          stream={stream}
                          onDelete={() => setPendingDelete(stream.id)}
                          onDuplicate={() => duplicateMutation.mutate(stream)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="space-y-3 lg:hidden">
              {results.map((stream) => (
                <li
                  key={stream.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-surface p-3"
                >
                  <img
                    src={stream.thumbnailUrl}
                    alt=""
                    loading="lazy"
                    className="aspect-video w-20 shrink-0 rounded object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{stream.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {getCategoryById(stream.categoryId)?.name} · {stream.type}
                    </p>
                    <div className="mt-1.5">
                      <StatusBadge stream={stream} />
                    </div>
                  </div>
                  <RowActions
                    stream={stream}
                    onDelete={() => setPendingDelete(stream.id)}
                    onDuplicate={() => duplicateMutation.mutate(stream)}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this stream?"
        description="This action cannot be undone. The stream and all its sources will be permanently removed."
        onConfirm={() => {
          if (pendingDelete) deleteMutation.mutate(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </AdminLayout>
  );
}

function RowActions({
  stream,
  onDelete,
  onDuplicate,
}: {
  stream: Stream;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Stream actions">
          <MoreHorizontal className="size-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/admin/streams/$id/edit" params={{ id: stream.id }}>
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onDuplicate}>Duplicate</DropdownMenuItem>
        <DropdownMenuItem onSelect={onDelete} className="text-destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
