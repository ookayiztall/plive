import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { formatCountdown } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Countdown({
  targetIso,
  className,
  showIcon = true,
}: {
  targetIso: string | null;
  className?: string;
  showIcon?: boolean;
}) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!targetIso) return;
    const target = new Date(targetIso).getTime();
    const tick = () => setRemaining(target - Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [targetIso]);

  if (!targetIso) return null;

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-xs font-semibold text-primary", className)}
    >
      {showIcon && <Timer className="size-3.5" aria-hidden />}
      {remaining === null ? "--" : formatCountdown(remaining)}
    </span>
  );
}
