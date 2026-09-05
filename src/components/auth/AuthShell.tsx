import { Link } from "@tanstack/react-router";
import { Radio } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <Link to="/" className="flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
          <Radio className="size-4" aria-hidden />
        </span>
        <span className="font-display text-2xl font-bold tracking-wide">PLIVE</span>
      </Link>

      <div className="mt-8 w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-elevated sm:p-8">
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>

      {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
    </div>
  );
}
