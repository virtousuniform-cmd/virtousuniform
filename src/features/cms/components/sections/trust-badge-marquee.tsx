import { ShieldCheck, Award, Globe2, Factory, Leaf, Clock } from "lucide-react";

const BADGES = [
  { icon: ShieldCheck, label: "ISO 9001:2015" },
  { icon: Globe2, label: "12+ Countries" },
  { icon: Award, label: "Premium Quality" },
  { icon: Clock, label: "24/7 Customer Service" },
];

/**
 * Infinite horizontal marquee of certification/standard badges, right
 * under the hero — trust signals are one of the highest-leverage things
 * a B2B manufacturing site can surface above the fold. Pure CSS keyframe
 * animation (see .marquee-track in globals.css), no JS animation loop.
 * The badge list is duplicated once so the loop is seamless.
 */
export function TrustBadgeMarquee() {
  const track = [...BADGES, ...BADGES];

  return (
    <div className="overflow-hidden border-y border-border bg-card py-4">
      <div className="marquee-track flex w-max gap-10">
        {track.map(({ icon: Icon, label }, i) => (
          <div
            key={`${label}-${i}`}
            className="flex items-center gap-2 text-sm font-medium whitespace-nowrap text-muted-foreground"
          >
            <Icon className="size-4 text-brand" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
