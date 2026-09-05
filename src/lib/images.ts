import heroFootball from "@/assets/hero-football.jpg";
import heroCombat from "@/assets/hero-combat.jpg";
import heroF1 from "@/assets/hero-f1.jpg";
import heroBasketball from "@/assets/hero-basketball.jpg";
import channelArt from "@/assets/channel-generic.jpg";

export const fallbackImages = {
  football: heroFootball,
  combat: heroCombat,
  f1: heroF1,
  basketball: heroBasketball,
  channel: channelArt,
};

/** Picks a sensible placeholder when a stream has no uploaded image yet. */
export function fallbackImageFor(group: string | null | undefined, type: string) {
  if (type === "channel") return fallbackImages.channel;
  switch ((group ?? "").toLowerCase()) {
    case "combat sports":
      return fallbackImages.combat;
    case "formula 1":
      return fallbackImages.f1;
    case "basketball":
      return fallbackImages.basketball;
    default:
      return fallbackImages.football;
  }
}
