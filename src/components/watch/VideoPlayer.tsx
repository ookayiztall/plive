import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  RotateCw,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { LiveBadge } from "@/components/common/badges";
import { cn } from "@/lib/utils";

export function VideoPlayer({
  posterUrl,
  title,
  isLive,
  streamUrl,
}: {
  posterUrl: string;
  title: string;
  isLive: boolean;
  streamUrl: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "error">(
    streamUrl ? "loading" : "ready",
  );
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [quality, setQuality] = useState("Auto");
  const [availableQualities, setAvailableQualities] = useState<string[]>(["Auto"]);

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) {
      setPhase("ready");
      return;
    }

    destroyHls();
    setPhase("loading");
    setPlaying(false);

    if (Hls.isSupported()) {
      const hls = new Hls({
        startLevel: -1,
        capLevelToPlayerSize: true,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        const levels = data.levels.map((l) => `${l.height}p`);
        setAvailableQualities(["Auto", ...levels]);
        setPhase("ready");
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setPhase("error");
              break;
          }
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", () => {
        setPhase("ready");
        video.play().catch(() => {});
      });
      return () => {
        video.src = "";
      };
    } else {
      setPhase("error");
    }

    return () => {
      destroyHls();
    };
  }, [streamUrl, destroyHls]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) video.play().catch(() => {});
    else video.pause();
  }, [playing]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
  }, [muted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    const hls = hlsRef.current;
    if (!hls) return;
    if (quality === "Auto") {
      hls.currentLevel = -1;
    } else {
      const height = parseInt(quality, 10);
      const level = hls.levels.findIndex((l) => l.height === height);
      if (level !== -1) hls.currentLevel = level;
    }
  }, [quality]);

  const toggleFullscreen = () => {
    const node = containerRef.current;
    const video = videoRef.current;
    if (!node) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else if (node.requestFullscreen) {
      void node.requestFullscreen();
    } else if (video && "webkitEnterFullscreen" in video) {
      void (video as HTMLVideoElement & { webkitEnterFullscreen: () => void }).webkitEnterFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-black"
    >
      <video
        ref={videoRef}
        poster={posterUrl}
        className={cn(
          "size-full object-cover",
          phase !== "ready" && "opacity-40",
        )}
        playsInline
        onClick={() => setPlaying((v) => !v)}
      />

      {!streamUrl && phase === "ready" && (
        <img
          src={posterUrl}
          alt={`${title} stream preview`}
          className="absolute inset-0 size-full object-cover"
        />
      )}

      {phase === "loading" && (
        <div className="absolute inset-0 grid place-items-center bg-background/70">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-7 animate-spin text-primary" aria-hidden />
            <p className="text-sm text-muted-foreground">Connecting to stream…</p>
          </div>
        </div>
      )}

      {phase === "error" && (
        <div className="absolute inset-0 grid place-items-center bg-background/85 px-6">
          <div className="max-w-sm text-center">
            <TriangleAlert className="mx-auto size-7 text-destructive" aria-hidden />
            <p className="mt-3 text-base font-semibold">Stream unavailable</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This source failed to load. Try reloading or switch to another server below.
            </p>
            <Button className="mt-4" size="sm" onClick={() => setPhase("loading")}>
              <RotateCw className="size-4" aria-hidden /> Reload stream
            </Button>
          </div>
        </div>
      )}

      {isLive && phase === "ready" && <LiveBadge className="absolute top-3 left-3" />}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={playing ? "Pause" : "Play"}
              onClick={() => setPlaying((v) => !v)}
              className="grid size-9 place-items-center rounded-md text-foreground transition-colors hover:bg-surface-2/70"
            >
              {playing ? (
                <Pause className="size-4 fill-current" aria-hidden />
              ) : (
                <Play className="size-4 fill-current" aria-hidden />
              )}
            </button>
            <button
              type="button"
              aria-label={muted ? "Unmute" : "Mute"}
              onClick={() => setMuted((v) => !v)}
              className="grid size-9 place-items-center rounded-md text-foreground transition-colors hover:bg-surface-2/70"
            >
              {muted ? (
                <VolumeX className="size-4" aria-hidden />
              ) : (
                <Volume2 className="size-4" aria-hidden />
              )}
            </button>
            <Slider
              value={[muted ? 0 : volume]}
              max={100}
              step={1}
              aria-label="Volume"
              onValueChange={(next) => {
                setVolume(next[0] ?? 0);
                setMuted((next[0] ?? 0) === 0);
              }}
              className="hidden w-24 sm:flex"
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-muted-foreground">
              {isLive ? "Live broadcast" : "Scheduled broadcast"}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Reload stream"
              onClick={() => {
                setPhase("loading");
                destroyHls();
              }}
              className="grid size-9 place-items-center rounded-md text-foreground transition-colors hover:bg-surface-2/70"
            >
              <RotateCw className="size-4" aria-hidden />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Player settings"
                  className="grid size-9 place-items-center rounded-md text-foreground transition-colors hover:bg-surface-2/70"
                >
                  <Settings className="size-4" aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Quality</DropdownMenuLabel>
                {availableQualities.map((option) => (
                  <DropdownMenuItem key={option} onSelect={() => setQuality(option)}>
                    <span className={cn(option === quality && "font-semibold text-primary")}>
                      {option}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              type="button"
              aria-label="Fullscreen"
              onClick={toggleFullscreen}
              className="grid size-9 place-items-center rounded-md text-foreground transition-colors hover:bg-surface-2/70"
            >
              <Maximize className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
