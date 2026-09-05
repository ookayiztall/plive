import { createFileRoute, Link, Outlet, useRouter } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  component: AdminGuard,
});

function AdminGuard() {
  const { user, loading } = useSession();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <ShieldAlert className="mx-auto size-12 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-semibold text-foreground">Authentication required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You need to be signed in to access the admin panel.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <ShieldAlert className="mx-auto size-12 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-semibold text-foreground">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You don't have permission to access the admin panel.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link to="/">Go home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
