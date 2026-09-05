import type { Stream } from "@/types";
import { StreamCard } from "@/components/streams/StreamCard";
import { EventCarousel } from "@/components/streams/EventCarousel";
import { EmptyState } from "@/components/common/EmptyState";
import { CalendarClock } from "lucide-react";

export function EventSection({ title, streams }: { title: string; streams: Stream[] }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="h-4 w-1 rounded-full bg-primary" />
        <h3 className="text-base font-semibold tracking-wide">{title}</h3>
      </div>
      {streams.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No events scheduled"
          description={`There is nothing on the ${title.toLowerCase()} schedule right now.`}
        />
      ) : (
        <EventCarousel controlsLabel={title}>
          {streams.map((stream) => (
            <StreamCard key={stream.id} stream={stream} />
          ))}
        </EventCarousel>
      )}
    </section>
  );
}
