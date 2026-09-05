import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, MoreHorizontal, SearchX } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { SearchInput } from "@/components/common/SearchInput";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchCategories, createCategory, updateCategory, deleteCategory, type CategoryInput } from "@/lib/api";
import type { Category } from "@/types";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({
    meta: [
      { title: "Category Management — PLive Admin" },
      { name: "description", content: "Manage sports categories and competitions on PLive." },
      { property: "og:title", content: "Category Management — PLive Admin" },
      { property: "og:description", content: "Manage sports categories and competitions." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminCategories,
});

function CategoryForm({
  category,
  onSubmit,
  submitting,
}: {
  category?: Category | undefined;
  onSubmit: (data: CategoryInput) => void;
  submitting: boolean;
}) {
  const [form, setForm] = useState<CategoryInput>({
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    group: category?.group ?? "",
    icon: category?.icon ?? "Trophy",
    color: category?.color ?? "oklch(0.66 0.16 300)",
    sortOrder: category?.sortOrder ?? 1,
    isActive: category?.isActive ?? true,
  });

  const set = <K extends keyof CategoryInput>(key: K, value: CategoryInput[K]) =>
    setForm((prev: CategoryInput) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cat-name">Name</Label>
          <Input id="cat-name" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-slug">Slug</Label>
          <Input id="cat-slug" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cat-desc">Description</Label>
        <Textarea
          id="cat-desc"
          rows={3}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="cat-group">Group</Label>
          <Input id="cat-group" value={form.group} onChange={(e) => set("group", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-order">Sort order</Label>
          <Input
            id="cat-order"
            type="number"
            value={form.sortOrder}
            onChange={(e) => set("sortOrder", Number(e.target.value))}
          />
        </div>
        <label className="mt-6 flex items-center justify-between gap-3 rounded-md border border-border bg-surface-2/50 px-4 py-2.5 text-sm">
          Active
          <Switch checked={form.isActive} onCheckedChange={(checked) => set("isActive", checked)} />
        </label>
      </div>
      <Button onClick={() => onSubmit(form)} disabled={submitting} className="w-full">
        {submitting ? "Saving..." : "Save category"}
      </Button>
    </div>
  );
}

function AdminCategories() {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories", { includeInactive: true }],
    queryFn: () => fetchCategories(true),
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCreating(false);
      toast.success("Category created");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CategoryInput> }) =>
      updateCategory(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditing(null);
      toast.success("Category updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setPendingDelete(null);
      toast.success("Category deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const results = categories.filter((category) =>
    category.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <AdminLayout
      title="Categories"
      description="Organise competitions and sports shown across the platform."
      actions={
        <Button onClick={() => setCreating(true)}>
          <Plus className="size-4" aria-hidden /> New category
        </Button>
      }
    >
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search categories…"
        className="max-w-sm"
      />

      <div className="mt-6">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-surface-2" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <EmptyState icon={SearchX} title="No categories" description="Nothing matches that search." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((category) => (
              <div
                key={category.id}
                className="rounded-lg border border-border bg-surface p-4"
              >
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-md text-xs font-bold"
                    style={{
                      backgroundColor: `color-mix(in oklab, ${category.color} 22%, transparent)`,
                      color: category.color,
                    }}
                    aria-hidden
                  >
                    {category.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{category.name}</p>
                    <p className="truncate text-xs text-muted-foreground">/{category.slug}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Category actions">
                        <MoreHorizontal className="size-4" aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => setEditing(category)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => setPendingDelete(category.id)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                  {category.description}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Order {category.sortOrder}</span>
                  <span className={category.isActive ? "text-success" : "text-muted-foreground"}>
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={creating || editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "Create category"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update category details." : "Add a new category to the platform."}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            category={editing ?? undefined}
            onSubmit={(data) => {
              if (editing) {
                updateMutation.mutate({ id: editing.id, input: data });
              } else {
                createMutation.mutate(data);
              }
            }}
            submitting={createMutation.isPending || updateMutation.isPending}
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this category?"
        description="Streams in this category would need reassigning. This action cannot be undone."
        onConfirm={() => {
          if (pendingDelete) deleteMutation.mutate(pendingDelete);
        }}
      />
    </AdminLayout>
  );
}
