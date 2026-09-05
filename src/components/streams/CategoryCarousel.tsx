import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Star,
  Swords,
  Flag,
  Globe,
  Circle,
  Dribbble,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  Trophy,
  Star,
  Swords,
  Flag,
  Globe,
  Circle,
  Dribbble,
};

export function CategoryCard({
  category,
  isActive = false,
}: {
  category: Category;
  isActive?: boolean;
}) {
  const Icon = icons[category.icon] ?? Trophy;
  return (
    <Link
      to="/category/$slug"
      params={{ slug: category.slug }}
      className={cn(
        "flex w-[190px] shrink-0 snap-start items-center gap-3 rounded-[20px] border bg-surface px-3 py-2.5 transition-colors",
        isActive
          ? "border-primary bg-surface-2"
          : "border-border hover:border-primary/50 hover:bg-surface-2",
      )}
    >
      {category.imageUrl ? (
        <img
          src={category.imageUrl}
          alt={category.name}
          className="size-9 shrink-0 rounded-md object-cover"
        />
      ) : (
        <span
          className="grid size-9 shrink-0 place-items-center rounded-md"
          style={{ backgroundColor: `color-mix(in oklab, ${category.color} 22%, transparent)` }}
        >
          <Icon className="size-4" style={{ color: category.color }} aria-hidden />
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{category.name}</span>
        <span className="block truncate text-[11px] text-muted-foreground">{category.group}</span>
      </span>
    </Link>
  );
}

export function CategoryCarousel({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string | undefined;
}) {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    railRef.current?.scrollBy({ left: direction * 400, behavior: "smooth" });
  };

  return (
    <div className="relative rounded-[20px] border border-border bg-surface/70 p-3">
      <div
        ref={railRef}
        className="scrollbar-none flex snap-x gap-3 overflow-x-auto sm:pr-20"
        aria-label="Sports categories"
      >
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            isActive={category.slug === activeSlug}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-3 hidden items-center gap-2 sm:flex">
        <button
          type="button"
          aria-label="Scroll categories left"
          onClick={() => scrollBy(-1)}
          className="pointer-events-auto grid size-8 place-items-center rounded-full border border-border bg-background/90 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Scroll categories right"
          onClick={() => scrollBy(1)}
          className="pointer-events-auto grid size-8 place-items-center rounded-full border border-border bg-background/90 text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
