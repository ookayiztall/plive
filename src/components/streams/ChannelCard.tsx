import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Radio } from "lucide-react";
import type { Stream } from "@/types";
import { fetchCategories } from "@/lib/api";
import { LiveBadge } from "@/components/common/badges";
import { cn } from "@/lib/utils";

export function ChannelCard({ stream, className }: { stream: Stream; className?: string }) {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
  });
  const category = categories.find((c) => c.id === stream.categoryId);
  const isLive = stream.status === "live";

  return (
    <Link
      to="/watch/$slug"
      params={{ slug: stream.slug }}
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card transition-colors hover:border-info/60",
        className,
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-surface-2">
        <img
          src={stream.thumbnailUrl}
          alt={stream.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 grid place-items-center bg-background/45">
          <span className="px-4 text-center font-display text-xl font-bold tracking-wide text-foreground uppercase">
            {stream.title}
          </span>
        </div>
        {isLive ? (
          <LiveBadge className="absolute top-2 left-2" />
        ) : (
          <span className="absolute top-2 left-2 rounded-md bg-muted px-2 py-1 text-[11px] font-bold text-muted-foreground uppercase">
            Offline
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 p-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{stream.title}</h3>
          <p className="truncate text-xs text-muted-foreground">{category?.name ?? "Sports"}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-info">
          <Radio className="size-3.5" aria-hidden />
          24/7
        </span>
      </div>
    </Link>
  );
}
