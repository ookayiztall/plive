import { useState, useRef, useCallback } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/session";

const RATE_LIMIT_MS = 3000;

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Account — PLive Sports Streaming" },
      { name: "description", content: "Create a free PLive account to watch live sports streams." },
      { property: "og:title", content: "Create Account — PLive" },
      { property: "og:description", content: "Create a free PLive account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { signUp } = useSession();
  const navigate = useNavigate();
  const lastSubmitRef = useRef(0);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (Date.now() - lastSubmitRef.current < RATE_LIMIT_MS) {
      setError("Please wait before trying again.");
      return;
    }
    lastSubmitRef.current = Date.now();

    if (form.name.trim().length < 2) {
      setError("Display name is too short.");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (form.password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (form.confirm !== form.password) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const result = await signUp(form.email, form.password, form.name);
    setSubmitting(false);

    if (result.error) {
      setError("Could not create account. Try a different email.");
    } else {
      setSuccess(true);
    }
  }, [form.name, form.email, form.password, form.confirm, signUp]);

  if (success) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="We sent you a confirmation link."
        footer={
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Back to login
          </Link>
        }
      >
        <div className="rounded-md border border-border bg-surface-2 p-4 text-sm text-muted-foreground">
          A confirmation link has been sent to{" "}
          <span className="text-foreground">{form.email}</span>. Please check your inbox and verify
          your email address before signing in.
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join PLive to follow every match, fight and race."
      footer={
        <span>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Login
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
          <Label htmlFor="name">Display name</Label>
          <Input
            id="name"
            type="text"
            value={form.name}
            onChange={set("name")}
            placeholder="Alex Morgan"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={set("password")}
            placeholder="••••••••"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            value={form.confirm}
            onChange={set("confirm")}
            placeholder="••••••••"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
