export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <section className="bg-primary py-20">
      <div className="mx-auto max-w-4xl px-6 text-center">
        {eyebrow && (
          <p className="text-sm font-medium tracking-wide text-brand uppercase">{eyebrow}</p>
        )}
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/70">{description}</p>
      </div>
    </section>
  );
}

/**
 * Structured placeholder body for pages whose full content build-out is
 * pending (see README "What's next"). Keeps every nav link resolving to a
 * real, on-brand page instead of a 404 while content is authored — this is
 * a build-sequencing placeholder, not permanent copy.
 */
export function PagePendingNotice({ page }: { page: string }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <p className="text-sm text-muted-foreground">
        The {page} page is structured and routed — full content is the next
        pass. Reach out via{" "}
        <a href="/contact" className="text-brand hover:underline">
          Contact
        </a>{" "}
        in the meantime.
      </p>
    </div>
  );
}
