import Link from "next/link";
import { Facebook, Linkedin, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { settingsRepository } from "@/features/settings/repositories/settings.repository";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./brand-logo";

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
            <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold text-primary-foreground group">
              <BrandLogo />
            </Link>
            <p className="mt-3 max-w-xs text-sm text-primary-foreground/60">
              Manufacturer of high-performance industrial, medical, and professional gloves,
              exporting to 12+ countries.
            </p>
            <div className="mt-4 space-y-2 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-brand" /> {contactInfo.address}
              </div>
              <div className="flex items-center gap-2">
                <WhatsAppIcon className="size-4 text-brand fill-brand" />
                <a href={`https://wa.me/${contactInfo.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors">
                  {contactInfo.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-brand" />
                <a href={`mailto:${contactInfo.email}`} className="hover:text-brand transition-colors">
                  {contactInfo.email}
                </a>
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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.87 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}
