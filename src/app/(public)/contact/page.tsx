import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { ContactForm } from "@/features/contact/components/contact-form";
import { settingsRepository } from "@/features/settings/repositories/settings.repository";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with our export and customer support team for general inquiries, partnership opportunities, or support.",
};

export default async function ContactPage() {
  const contactInfo = await settingsRepository.getContactInfo();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12 max-w-2xl">
        <p className="text-sm font-medium tracking-wide text-brand uppercase">Contact</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Get in Touch
        </h1>
        <p className="mt-3 text-muted-foreground">
          Have a general question, partnership inquiry, or need support? Send us a
          message. Looking for pricing on specific products?{" "}
          <Link href="/request-quote" className="text-brand hover:underline">
            Submit a request for quotation
          </Link>{" "}
          instead for a faster response.
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
        <ContactForm />

        <aside className="space-y-6">
          <ContactInfoRow
            icon={Mail}
            label="Email"
            value={contactInfo.email}
            href={`mailto:${contactInfo.email}`}
          />
          <ContactInfoRow
            icon={Phone}
            label="Phone"
            value={contactInfo.phone}
            href={`tel:${contactInfo.phone.replace(/\s+/g, "")}`}
          />
          <ContactInfoRow icon={MapPin} label="Factory Address" value={contactInfo.address} />
        </aside>
      </div>
    </div>
  );
}

function ContactInfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );

  return href ? (
    <a href={href} className="block hover:opacity-80">
      {content}
    </a>
  ) : (
    content
  );
}
