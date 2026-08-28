import { Globe2, Award, Factory, ShieldCheck } from "lucide-react";
import { AnimatedCounter } from "@/components/motion/animated-counter";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

type StatItem = { label: string; value: number; suffix?: string };
type StatisticsContent = { items: StatItem[] };

const ICONS = [Globe2, Award, Factory, ShieldCheck];

export function StatisticsSection({ content }: { content: StatisticsContent }) {
  if (!content.items?.length) return null;

  return (
    <section className="border-y border-border bg-primary">
      <RevealGroup className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-16 sm:grid-cols-4">
        {content.items.map((stat, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <RevealItem key={stat.label} className="text-center">
              <Icon className="mx-auto mb-3 size-5 text-brand" />
              <p className="font-display text-4xl font-semibold text-primary-foreground sm:text-5xl">
                <AnimatedCounter value={stat.value} suffix={stat.suffix ?? "+"} />
              </p>
              <p className="mt-1 text-sm text-primary-foreground/70">{stat.label}</p>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </section>
  );
}
