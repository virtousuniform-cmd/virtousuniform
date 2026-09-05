import Link from "next/link";
import { Facebook, Linkedin, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { settingsRepository } from "@/features/settings/repositories/settings.repository";
import { cn } from "@/lib/utils";

const FOOTER_COLUMNS = [
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/manufacturing-process", label: "Manufacturing Process" },
      { href: "/why-choose-us", label: "Why Choose Us" },
      { href: "/career", label: "Careers" },
    ],
  },
  {
    heading: "Products",
    links: [
      { href: "/products", label: "Browse Products" },
      { href: "/request-quote", label: "Request a Quotation" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/gallery", label: "Gallery" },
      { href: "/certifications", label: "Certifications" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/contact", label: "Contact Us" },
    ],
  },
];

export async function SiteFooter({ publishedSlugs = [] }: { publishedSlugs?: string[] }) {
  const [contactInfo, socialLinks] = await Promise.all([
    settingsRepository.getContactInfo(),
    settingsRepository.getSocialLinks(),
  ]);

  const dynamicFooterColumns = FOOTER_COLUMNS.map((col) => ({
    ...col,
    links: col.links.filter((link) => {
      const slug = link.href.replace("/", "");
      if (link.href === "/products" || link.href === "/request-quote" || link.href === "/contact" || link.href === "/about") return true;
      if (slug.startsWith("admin") || slug.startsWith("dashboard")) return true;
      return publishedSlugs.includes(slug);
    }),
  })).filter((col) => col.links.length > 0);

  return (
    // Charcoal, matching the header — bookends the site so the amber
    // accent inside (icons, hover states, CTA) reads as the one
    // consistent brand signature from top to bottom of every page.
    <footer className="border-t border-white/10 bg-primary">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold text-primary-foreground">
              <span className="flex size-7 items-center justify-center rounded-md bg-brand text-sm font-bold text-brand-foreground">
                VU
              </span>
              Virtuous<span className="text-brand">Uniform</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-primary-foreground/60">
              Manufacturer of high-performance industrial, medical, and professional gloves,
              exporting to 12+ countries.
            </p>
            <div className="mt-4 space-y-2 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-brand" /> {contactInfo.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-brand" /> {contactInfo.phone}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-brand" /> {contactInfo.address}
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="flex size-8 items-center justify-center rounded-full bg-white/10 text-primary-foreground/80 hover:bg-brand hover:text-brand-foreground"
                >
                  <Linkedin className="size-4" />
                </a>
              )}
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex size-8 items-center justify-center rounded-full bg-white/10 text-primary-foreground/80 hover:bg-brand hover:text-brand-foreground"
                >
                  <Facebook className="size-4" />
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X / Twitter"
                  className="flex size-8 items-center justify-center rounded-full bg-white/10 text-primary-foreground/80 hover:bg-brand hover:text-brand-foreground"
                >
                  <Twitter className="size-4" />
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex size-8 items-center justify-center rounded-full bg-white/10 text-primary-foreground/80 hover:bg-brand hover:text-brand-foreground"
                >
                  <Instagram className="size-4" />
                </a>
              )}
            </div>
          </div>

          {dynamicFooterColumns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-sm font-semibold text-primary-foreground">{col.heading}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-primary-foreground/60 hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} Virtuous Uniform Co. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-primary-foreground/50">
            <Link
              href="/privacy-policy"
              className={cn("hover:text-brand", !publishedSlugs.includes("privacy-policy") && "hidden")}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className={cn("hover:text-brand", !publishedSlugs.includes("terms") && "hidden")}
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
