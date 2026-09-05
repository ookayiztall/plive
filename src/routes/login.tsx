import { useState, useRef, useCallback } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useSession } from "@/lib/session";

const MIN_PASSWORD_LENGTH = 8;
const RATE_LIMIT_MS = 2000;

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — PLive Sports Streaming" },
      { name: "description", content: "Sign in to your PLive account to watch live sport." },
      { property: "og:title", content: "Login — PLive" },
      { property: "og:description", content: "Sign in to your PLive account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useSession();
  const navigate = useNavigate();
  const lastSubmitRef = useRef(0);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (Date.now() - lastSubmitRef.current < RATE_LIMIT_MS) {
      setError("Please wait before trying again.");
      return;
    }
    lastSubmitRef.current = Date.now();

    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);

    if (result.error) {
      setError("Invalid email or password.");
    } else {
      navigate({ to: "/" });
    }
  }, [email, password, signIn, navigate]);

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue watching live sport."
      footer={
        <span>
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Register
          </Link>
        </span>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox id="remember" /> Remember me
          </label>
          <Link to="/forgot-password" className="text-sm text-info hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Signing in..." : "Login"}
        </Button>
      </form>
    </AuthShell>
  );
}
