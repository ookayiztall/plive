import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, ArrowUp, ArrowDown, ImageUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchCategories, createStream, updateStream, uploadStreamImage, type StreamInput } from "@/lib/api";
import type { Stream, StreamSource } from "@/types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold tracking-wide uppercase">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

const emptySource = (index: number): StreamSource => ({
  id: `new-${index}-${Math.random().toString(36).slice(2, 8)}`,
  name: `Stream ${index + 1}`,
  description: index === 0 ? "Recommended source" : "Backup source",
  type: "hls",
  url: "",
  priority: index + 1,
  isActive: true,
  isDefault: index === 0,
});

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function StreamForm({ stream }: { stream?: Stream | undefined }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(stream);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", { includeInactive: true }],
    queryFn: () => fetchCategories(true),
  });

  const [form, setForm] = useState({
    title: stream?.title ?? "",
    slug: stream?.slug ?? "",
    shortDescription: stream?.shortDescription ?? "",
    description: stream?.description ?? "",
    categoryId: stream?.categoryId ?? categories[0]?.id ?? "",
    type: stream?.type ?? ("event" as const),
    status: stream?.status ?? ("draft" as const),
    visibility: stream?.visibility ?? ("public" as const),
    startDate: stream?.startsAt?.slice(0, 10) ?? "",
    startTime: stream?.startsAt?.slice(11, 16) ?? "",
    endDate: stream?.endsAt?.slice(0, 10) ?? "",
    endTime: stream?.endsAt?.slice(11, 16) ?? "",
    isFeatured: stream?.isFeatured ?? false,
    isActive: stream?.isActive ?? true,
    thumbnailUrl: stream?.thumbnailUrl ?? null,
    heroUrl: stream?.heroUrl ?? null,
  });
  const [sources, setSources] = useState<StreamSource[]>(stream?.sources ?? [emptySource(0)]);
  const [uploading, setUploading] = useState<"thumbnail" | "hero" | null>(null);

  const createMutation = useMutation({
    mutationFn: createStream,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streams"] });
      toast.success("Stream created");
      navigate({ to: "/admin/streams" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (input: StreamInput) => updateStream(stream!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streams"] });
      toast.success("Stream updated");
      navigate({ to: "/admin/streams" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const updateSource = (id: string, patch: Partial<StreamSource>) =>
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const moveSource = (index: number, direction: -1 | 1) =>
    setSources((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      const a = next[index]!;
      const b = next[target]!;
      next[index] = b;
      next[target] = a;
      return next.map((s, i) => ({ ...s, priority: i + 1 }));
    });

  const handleImageUpload = async (field: "thumbnailUrl" | "heroUrl", file: File) => {
    setUploading(field === "thumbnailUrl" ? "thumbnail" : "hero");
    try {
      const url = await uploadStreamImage(file);
      set(field, url);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const startsAt =
      form.startDate && form.startTime
        ? `${form.startDate}T${form.startTime}:00Z`
        : form.startDate
          ? `${form.startDate}T00:00:00Z`
          : null;

    const endsAt =
      form.endDate && form.endTime
        ? `${form.endDate}T${form.endTime}:00Z`
        : form.endDate
          ? `${form.endDate}T00:00:00Z`
          : null;

    const input: StreamInput = {
      title: form.title,
      slug: form.slug || toSlug(form.title),
      shortDescription: form.shortDescription,
      description: form.description,
      categoryId: form.categoryId || null,
      thumbnailUrl: form.thumbnailUrl,
      heroUrl: form.heroUrl,
      type: form.type,
      status: form.status,
      visibility: form.visibility,
      startsAt,
      endsAt,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
      sources: sources.map(({ id, ...rest }) => rest),
    };

    if (isEditing) {
      updateMutation.mutate(input);
    } else {
      createMutation.mutate(input);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Section title="Basic information">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              value={form.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (!isEditing) set("slug", toSlug(e.target.value));
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="short">Short description</Label>
          <Input
            id="short"
            value={form.shortDescription}
            onChange={(e) => set("shortDescription", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
      </Section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Category">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={form.categoryId} onValueChange={(v) => set("categoryId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.categoryId && (() => {
              const selected = categories.find((c) => c.id === form.categoryId);
              return selected?.group ? (
                <p className="text-xs text-muted-foreground">
                  Tag shown: <span className="font-medium text-foreground">{selected.group}</span>
                </p>
              ) : null;
            })()}
          </div>
        </Section>

        <Section title="Images">
          <div className="grid gap-4 sm:grid-cols-2">
            {([
              ["thumbnailUrl", "Thumbnail"],
              ["heroUrl", "Hero / banner"],
            ] as const).map(([field, label]) => (
              <div key={field} className="space-y-1.5">
                <Label>{label}</Label>
                {form[field] ? (
                  <div className="relative">
                    <img
                      src={form[field]!}
                      alt={label}
                      className="aspect-video w-full rounded-md object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 size-7"
                      onClick={() => set(field, null)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-border bg-surface-2/50 px-4 py-6 text-xs text-muted-foreground hover:border-primary/50">
                    <ImageUp className="size-5" aria-hidden />
                    {uploading === (field === "thumbnailUrl" ? "thumbnail" : "hero")
                      ? "Uploading..."
                      : "Upload image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(field, file);
                      }}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Section title="Stream type">
          <Select
            value={form.type}
            onValueChange={(v) => set("type", v as (typeof form)["type"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="event">Scheduled event</SelectItem>
              <SelectItem value="channel">24/7 channel</SelectItem>
            </SelectContent>
          </Select>
        </Section>

        <Section title="Status">
          <Select
            value={form.status}
            onValueChange={(v) => set("status", v as (typeof form)["status"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["draft", "scheduled", "live", "ended", "offline"].map((status) => (
                <SelectItem key={status} value={status} className="capitalize">
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Section>

        <Section title="Visibility">
          <Select
            value={form.visibility}
            onValueChange={(v) => set("visibility", v as (typeof form)["visibility"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="registered">Registered users</SelectItem>
            </SelectContent>
          </Select>
        </Section>
      </div>

      <Section title="Schedule">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["startDate", "Start date", "date"],
              ["startTime", "Start time", "time"],
              ["endDate", "End date", "date"],
              ["endTime", "End time", "time"],
            ] as const
          ).map(([key, label, type]) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                type={type}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Options">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-2/50 px-4 py-3 text-sm">
            Featured
            <Switch
              checked={form.isFeatured}
              onCheckedChange={(checked) => set("isFeatured", checked)}
            />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-2/50 px-4 py-3 text-sm">
            Active
            <Switch
              checked={form.isActive}
              onCheckedChange={(checked) => set("isActive", checked)}
            />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-2/50 px-4 py-3 text-sm">
            24/7
            <Switch
              checked={form.type === "channel"}
              onCheckedChange={(checked) => set("type", checked ? "channel" : "event")}
            />
          </label>
        </div>
      </Section>

      <Section title="Stream sources">
        <div className="space-y-4">
          {sources.map((source, index) => (
            <div key={source.id} className="rounded-md border border-border bg-surface-2/40 p-4">
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-surface text-xs font-bold text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 truncate text-sm font-semibold">
                  {source.name || "Untitled source"}
                </span>
                <span className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Move source up"
                    onClick={() => moveSource(index, -1)}
                  >
                    <ArrowUp className="size-4" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Move source down"
                    onClick={() => moveSource(index, 1)}
                  >
                    <ArrowDown className="size-4" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Remove source"
                    onClick={() => setSources((prev) => prev.filter((s) => s.id !== source.id))}
                  >
                    <Trash2 className="size-4 text-destructive" aria-hidden />
                  </Button>
                </span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input
                    value={source.name}
                    onChange={(e) => updateSource(source.id, { name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Input
                    value={source.description}
                    onChange={(e) => updateSource(source.id, { description: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Source type</Label>
                  <Select
                    value={source.type}
                    onValueChange={(v) =>
                      updateSource(source.id, { type: v as StreamSource["type"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hls">HLS</SelectItem>
                      <SelectItem value="m3u8">M3U8</SelectItem>
                      <SelectItem value="iframe">Iframe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Priority</Label>
                  <Input
                    type="number"
                    min={1}
                    value={source.priority}
                    onChange={(e) =>
                      updateSource(source.id, { priority: Number(e.target.value) || 1 })
                    }
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Source URL</Label>
                  <Input
                    placeholder="https://example.com/stream.m3u8"
                    value={source.url}
                    onChange={(e) => updateSource(source.id, { url: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-4 py-2.5 text-sm">
                  Active
                  <Switch
                    checked={source.isActive}
                    onCheckedChange={(checked) => updateSource(source.id, { isActive: checked })}
                  />
                </label>
                <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-4 py-2.5 text-sm">
                  Default source
                  <Switch
                    checked={source.isDefault}
                    onCheckedChange={(checked) =>
                      setSources((prev) =>
                        prev.map((s) => ({ ...s, isDefault: checked && s.id === source.id })),
                      )
                    }
                  />
                </label>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => setSources((prev) => [...prev, emptySource(prev.length)])}
          >
            <Plus className="size-4" aria-hidden /> Add source
          </Button>
        </div>
      </Section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update stream" : "Create stream"}
        </Button>
        <Button asChild type="button" variant="ghost">
          <Link to="/admin/streams">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
