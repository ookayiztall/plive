import { cn } from "@/lib/utils";
import type { Stream, StreamStatus } from "@/types";
import { statusLabel } from "@/lib/format";

export function LiveBadge({
  className,
  label = "LIVE",
}: {
  className?: string | undefined;
  label?: string | undefined;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/14 px-2.5 py-1 text-[10px] font-[950] tracking-wider text-white uppercase backdrop-blur-[12px] live-pulse-badge",
        className,
      )}
    >
      <span className="live-dot" />
      {label}
    </span>
  );
}

const styles: Record<StreamStatus | "channel", string> = {
  live: "bg-live text-live-foreground",
  scheduled: "bg-surface-2 text-foreground",
  ended: "bg-muted text-muted-foreground",
  draft: "bg-muted text-muted-foreground",
  offline: "bg-muted text-muted-foreground",
  channel: "bg-info text-info-foreground",
};

export function StatusBadge({ stream, className }: { stream: Stream; className?: string }) {
  const isChannel = stream.type === "channel" && stream.status === "live";
  if (stream.status === "live") {
    return <LiveBadge className={className} label={isChannel ? "24/7 LIVE" : "LIVE"} />;
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-[11px] font-bold tracking-wide uppercase",
        styles[stream.status],
        className,
      )}
    >
      {statusLabel(stream)}
    </span>
  );
}

export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-surface-2 px-3 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}
