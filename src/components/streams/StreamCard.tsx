import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";
import type { Stream } from "@/types";
import { fetchCategories } from "@/lib/api";
import { formatDateBadge, formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/components/common/badges";
import { Countdown } from "@/components/common/Countdown";
import { cn } from "@/lib/utils";

export function StreamCard({ stream, className }: { stream: Stream; className?: string }) {
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
        "group flex w-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card transition-colors hover:border-primary/50",
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
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
        <span className="absolute top-2 left-2 rounded-md bg-background/85 px-2 py-1 text-[11px] font-bold tracking-wide text-foreground uppercase">
          {formatDateBadge(stream.startsAt)}
        </span>
        <div className="absolute top-2 right-2">
          <StatusBadge stream={stream} />
        </div>
        <span className="absolute right-2 bottom-2 grid size-9 place-items-center rounded-full bg-primary text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100">
          <Play className="size-4 fill-current" aria-hidden />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-foreground">
          {stream.title}
        </h3>
        <p className="text-xs text-muted-foreground">{category?.name ?? "Sports"}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          {isLive ? (
            <span className="text-xs font-semibold text-live">Live now</span>
          ) : (
            <Countdown targetIso={stream.startsAt} />
          )}
          <span className="text-xs text-muted-foreground">{formatDateTime(stream.startsAt)}</span>
        </div>
      </div>
    </Link>
  );
}
