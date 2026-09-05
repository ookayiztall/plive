import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { SearchX } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SearchInput } from "@/components/common/SearchInput";
import { FilterBar } from "@/components/common/FilterBar";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { fetchUsers, setUserStatus, setUserRole } from "@/lib/api";
import type { AppUser, UserRole, UserStatus } from "@/types";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "User Management — PLive Admin" },
      { name: "description", content: "Review PLive accounts, roles and statuses." },
      { property: "og:title", content: "User Management — PLive Admin" },
      { property: "og:description", content: "Review accounts, roles and statuses." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminUsers,
});

function AdminUsers() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<AppUser | null>(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchUsers(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: UserStatus }) =>
      setUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User status updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      setUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User role updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const results = users.filter((user) => {
    const matchesRole = role === "all" || user.role === role;
    const matchesStatus = status === "all" || user.status === status;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      user.displayName.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
    return matchesRole && matchesStatus && matchesQuery;
  });

  return (
    <AdminLayout title="Users" description="Accounts registered on the platform.">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,320px)_auto_auto] lg:items-center">
        <SearchInput value={query} onChange={setQuery} placeholder="Search users…" />
        <FilterBar
          options={[
            { label: "All roles", value: "all" },
            { label: "User", value: "user" },
            { label: "Admin", value: "admin" },
          ]}
          value={role}
          onChange={setRole}
          ariaLabel="Filter by role"
        />
        <FilterBar
          options={[
            { label: "All statuses", value: "all" },
            { label: "Active", value: "active" },
            { label: "Suspended", value: "suspended" },
          ]}
          value={status}
          onChange={setStatus}
          ariaLabel="Filter by status"
        />
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-2" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <EmptyState icon={SearchX} title="No users found" description="Try a different filter." />
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-lg border border-border bg-surface lg:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                  <tr>
                    <th className="p-3 font-medium">User</th>
                    <th className="p-3 font-medium">Email</th>
                    <th className="p-3 font-medium">Role</th>
                    <th className="p-3 font-medium">Joined</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {results.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-2/50">
                      <td className="p-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar className="size-8 shrink-0">
                            <AvatarFallback className="bg-surface-2 text-xs">
                              {user.displayName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate font-medium">{user.displayName}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{user.email}</td>
                      <td className="p-3 capitalize">{user.role}</td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(user.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span
                          className={
                            user.status === "active"
                              ? "text-xs font-semibold text-success"
                              : "text-xs font-semibold text-destructive"
                          }
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelected(user)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="space-y-3 lg:hidden">
              {results.map((user) => (
                <li
                  key={user.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-surface p-3"
                >
                  <Avatar className="size-9 shrink-0">
                    <AvatarFallback className="bg-surface-2 text-xs">
                      {user.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{user.displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    <p className="mt-1 text-xs text-muted-foreground capitalize">
                      {user.role} · {user.status}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelected(user)}>
                    View
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selected?.displayName}</SheetTitle>
            <SheetDescription>{selected?.email}</SheetDescription>
          </SheetHeader>
          {selected && (
            <dl className="space-y-4 px-4 text-sm">
              {[
                ["Role", selected.role],
                ["Status", selected.status],
                ["Joined", new Date(selected.joinedAt).toLocaleString()],
                ["User ID", selected.id],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs tracking-wide text-muted-foreground uppercase">{label}</dt>
                  <dd className="mt-1 break-all capitalize">{value}</dd>
                </div>
              ))}
              <div className="space-y-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    roleMutation.mutate({
                      userId: selected.id,
                      role: selected.role === "admin" ? "user" : "admin",
                    });
                    setSelected(null);
                  }}
                >
                  {selected.role === "admin" ? "Remove admin" : "Make admin"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    statusMutation.mutate({
                      userId: selected.id,
                      status: selected.status === "active" ? "suspended" : "active",
                    });
                    setSelected(null);
                  }}
                >
                  {selected.status === "active" ? "Suspend user" : "Activate user"}
                </Button>
              </div>
            </dl>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}
