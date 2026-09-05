import { useState, useRef, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/session";

const RATE_LIMIT_MS = 5000;

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Your Password — PLive" },
      { name: "description", content: "Request a password reset link for your PLive account." },
      { property: "og:title", content: "Reset Your Password — PLive" },
      { property: "og:description", content: "Request a password reset link." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { sendPasswordResetEmail } = useSession();
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

    setSubmitting(true);
    const result = await sendPasswordResetEmail(email);
    setSubmitting(false);

    if (result.error) {
      setError("If an account exists, a reset link has been sent.");
    } else {
      setSent(true);
    }
  }, [email, sendPasswordResetEmail]);

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Back to login
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-md border border-border bg-surface-2 p-4 text-sm text-muted-foreground">
          If an account exists for <span className="text-foreground">{email}</span>, a reset link has
          been sent. Please check your inbox.
        </div>
      ) : (
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
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
