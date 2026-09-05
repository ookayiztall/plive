import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Horizontal scroll rail with desktop arrow controls and touch scrolling on mobile. */
export function EventCarousel({
  children,
  className,
  itemClassName = "w-[260px] sm:w-[280px]",
  controlsLabel = "carousel",
}: {
  children: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  controlsLabel?: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.max(rail.clientWidth * 0.8, 240), behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      <div className="mb-2 hidden justify-end gap-2 sm:flex">
        <button
          type="button"
          aria-label={`Scroll ${controlsLabel} left`}
          onClick={() => scrollBy(-1)}
          className="grid size-8 place-items-center rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          aria-label={`Scroll ${controlsLabel} right`}
          onClick={() => scrollBy(1)}
          className="grid size-8 place-items-center rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
      <div
        ref={railRef}
        className="scrollbar-none -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2"
      >
        {children.map((child, index) => (
          <div key={index} className={cn("shrink-0 snap-start", itemClassName)}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
