import type { StreamSource } from "@/types";
import { cn } from "@/lib/utils";

function ServerCard({
  source,
  index,
  selected,
  onSelect,
}: {
  source: StreamSource;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border bg-surface px-4 py-3 text-left transition-colors",
        selected
          ? "border-live bg-surface-2"
          : "border-border hover:border-primary/50 hover:bg-surface-2",
      )}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-md text-xs font-bold",
          selected ? "bg-live/15 text-live" : "bg-surface-2 text-muted-foreground",
        )}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{source.name}</span>
        <span className="block truncate text-xs text-muted-foreground">{source.description}</span>
      </span>
      <span
        className={cn(
          "size-2.5 shrink-0 rounded-full",
          selected ? "bg-success" : "border border-muted-foreground/60",
        )}
        aria-hidden
      />
    </button>
  );
}

export function ServerSelector({
  sources,
  selectedId,
  onSelect,
}: {
  sources: StreamSource[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {sources.map((source, index) => (
        <ServerCard
          key={source.id}
          source={source}
          index={index}
          selected={source.id === selectedId}
          onSelect={() => onSelect(source.id)}
        />
      ))}
    </div>
  );
}
