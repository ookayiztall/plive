import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
}

export function FilterBar({
  options,
  value,
  onChange,
  className,
  ariaLabel = "Filters",
}: {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1", className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "shrink-0 rounded-md border px-3.5 py-2 text-sm font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
