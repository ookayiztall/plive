import type { Stream, StreamStatus } from "@/types";

export const formatDateTime = (iso: string | null) => {
  if (!iso) return "Always on";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateBadge = (iso: string | null) => {
  if (!iso) return "24/7";
  return new Date(iso)
    .toLocaleDateString(undefined, { day: "2-digit", month: "short" })
    .toUpperCase();
};

export const formatDay = (iso: string | null) => {
  if (!iso) return "Always on";
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

export const formatTime = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
};

export const formatCountdown = (msRemaining: number) => {
  if (msRemaining <= 0) return "Starting now";
  const totalSeconds = Math.floor(msRemaining / 1000);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
};

export const statusLabel = (stream: Pick<Stream, "status" | "type">): string => {
  if (stream.type === "channel" && stream.status === "live") return "24/7";
  const labels: Record<StreamStatus, string> = {
    live: "Live",
    scheduled: "Upcoming",
    ended: "Ended",
    draft: "Draft",
    offline: "Offline",
  };
  return labels[stream.status];
};

export const isSameDay = (iso: string | null, reference: Date) => {
  if (!iso) return false;
  const date = new Date(iso);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
};
