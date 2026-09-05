import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { FeaturedSlide } from "@/types";
import { LiveBadge } from "@/components/common/badges";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroCarousel({ slides }: { slides: FeaturedSlide[] }) {
  const [index, setIndex] = useState(0);

  const go = useCallback(
    (next: number) => setIndex((next + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      className="hero-fullbleed relative h-[320px] overflow-hidden rounded-[20px] border border-border sm:h-[400px]"
      aria-roledescription="carousel"
      aria-label="Featured events"
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          aria-hidden={i !== index}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            i === index ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <img
            src={slide.imageUrl}
            alt={slide.title}
            width={1600}
            height={900}
            className={cn(
              "size-full object-cover",
              i === index && "hero-zoom",
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/25" />
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto flex w-full max-w-[1400px] flex-col items-start gap-3 px-5 sm:px-8">
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-primary/40 bg-primary/15 px-2.5 py-1 text-[11px] font-bold tracking-widest text-primary uppercase">
                  {slide.badge}
                </span>
                {slide.isLive && <LiveBadge />}
              </div>
              <h1 className="max-w-2xl text-3xl leading-[1.05] font-bold tracking-tight sm:text-5xl">
                {slide.title}
              </h1>
              <p className="max-w-lg text-sm text-muted-foreground sm:text-base">
                {slide.description}
              </p>
              <Button asChild size="lg" className="mt-2">
                <Link to="/watch/$slug" params={{ slug: slide.streamSlug }}>
                  <Play className="size-4 fill-current" aria-hidden />
                  {slide.isLive ? "Watch live" : "View event"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute right-4 bottom-4 flex gap-2">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => go(index - 1)}
          className="grid size-9 place-items-center rounded-full border border-border bg-background/80 text-foreground transition-colors hover:bg-surface-2"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => go(index + 1)}
          className="grid size-9 place-items-center rounded-full border border-border bg-background/80 text-foreground transition-colors hover:bg-surface-2"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>

      <div className="absolute bottom-6 left-5 flex gap-1.5 sm:left-8">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-6 bg-primary" : "w-2.5 bg-muted-foreground/50 hover:bg-foreground/70",
            )}
          />
        ))}
      </div>
    </section>
  );
}
