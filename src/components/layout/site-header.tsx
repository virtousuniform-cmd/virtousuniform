"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "@/lib/auth-client";

const COMPANY_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/manufacturing-process", label: "Manufacturing Process" },
  { href: "/why-choose-us", label: "Why Choose Us" },
  { href: "/quality-assurance", label: "Quality Assurance" },
  { href: "/research-development", label: "Research & Development" },
  { href: "/certifications", label: "Certifications" },
  { href: "/factory-tour", label: "Factory Tour" },
];

const RESOURCES_LINKS = [
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Blog" },
  { href: "/news", label: "News" },
  { href: "/faq", label: "FAQ" },
  { href: "/career", label: "Careers" },
];

const SIMPLE_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/industries-served", label: "Industries Served" },
  { href: "/export-markets", label: "Export Markets" },
];

export function SiteHeader({ publishedSlugs = [] }: { publishedSlugs?: string[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR"];
  const user = session?.user as { role?: string; name?: string; email?: string } | undefined;
  const isAdmin = user?.role && STAFF_ROLES.includes(user.role);
  const dashboardHref = isAdmin ? "/admin" : "/dashboard";

  const dynamicCompanyLinks = COMPANY_LINKS.filter(
    (link) => publishedSlugs.includes(link.href.replace("/", "")) || link.href === "/about",
  );

  const dynamicResourceLinks = RESOURCES_LINKS.filter(
    (link) => publishedSlugs.includes(link.href.replace("/", ""))
  );

  const dynamicSimpleLinks = SIMPLE_LINKS.filter(
    (link) =>
      link.href === "/products" ||
      publishedSlugs.includes(link.href.replace("/", ""))
  );

  return (
    // Charcoal, always-solid header — bookends the site with the equally
    // dark footer. Deliberately not white/blurred: on an industrial site
    // this reads as confident and premium rather than "generic SaaS".
    <header className="sticky top-0 z-40 border-b border-white/10 bg-primary">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold text-primary-foreground">
          <span className="flex size-7 items-center justify-center rounded-md bg-brand text-sm font-bold text-brand-foreground">
            V
          </span>
          Virtous<span className="text-brand">Uniform</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {dynamicCompanyLinks.length > 0 && <NavDropdown label="Company" items={dynamicCompanyLinks} />}
          {dynamicSimpleLinks.map((link) => (
            <NavLink key={link.href} href={link.href} active={pathname === link.href}>
              {link.label}
            </NavLink>
          ))}
          {dynamicResourceLinks.length > 0 && <NavDropdown label="Resources" items={dynamicResourceLinks} />}
          <NavLink href="/contact" active={pathname === "/contact"}>
            Contact
          </NavLink>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {!isPending && (
            <>
              {session ? (
                <NavDropdown
                  label="My Account"
                  items={[
                    { href: dashboardHref, label: "Dashboard" },
                    { href: `${dashboardHref}/profile`, label: "Profile Settings" },
                    {
                      href: "#",
                      label: "Sign Out",
                      onClick: handleSignOut,
                    },
                  ]}
                />
              ) : (
                <Button
                  variant="ghost"
                  asChild
                  className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              )}
            </>
          )}
          <Button variant="brand" asChild>
            <Link href="/request-quote">Request a Quotation</Link>
          </Button>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          {!isPending && !session && (
            <Link
              href="/login"
              className="px-3 py-2 text-sm font-medium text-primary-foreground/90 hover:text-primary-foreground"
            >
              Sign In
            </Link>
          )}
          {session && (
            <Link
              href={dashboardHref}
              className="flex size-9 items-center justify-center rounded-md text-primary-foreground/90 hover:bg-white/10"
            >
              <User className="size-5" />
            </Link>
          )}
          <button
            className="flex size-9 items-center justify-center rounded-md text-primary-foreground/90 hover:bg-white/10"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-primary px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {[...dynamicSimpleLinks, ...dynamicCompanyLinks, ...dynamicResourceLinks, { href: "/contact", label: "Contact" }].map(
              (link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/90 hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
            {!isPending && (
              <>
                {session ? (
                  <>
                    <Button
                      variant="outline"
                      asChild
                      className="border-white/20 bg-transparent text-primary-foreground hover:bg-white/10"
                    >
                      <Link href={dashboardHref} onClick={() => setMobileOpen(false)}>
                        <User className="mr-2 size-4" />
                        My Account
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-primary-foreground hover:bg-white/10"
                      onClick={() => {
                        handleSignOut();
                        setMobileOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 size-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    asChild
                    className="border-white/20 bg-transparent text-primary-foreground hover:bg-white/10"
                  >
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                )}
              </>
            )}
            <Button variant="brand" asChild>
              <Link href="/request-quote" onClick={() => setMobileOpen(false)}>
                Request a Quotation
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active ? "text-brand" : "text-primary-foreground/85 hover:text-primary-foreground",
      )}
    >
      {children}
      {active && (
        <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand" />
      )}
    </Link>
  );
}

function NavDropdown({
  label,
  items,
}: {
  label: string;
  items: { href: string; label: string; onClick?: () => void }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/85 hover:text-primary-foreground">
        {label}
        <ChevronDown className="size-3.5" />
      </button>
      {open && (
        <div className="absolute top-full right-0 w-56 rounded-lg border border-border bg-popover p-2 shadow-lg">
          {items.map((item, i) => (
            <Link
              key={`${item.href}-${i}`}
              href={item.href}
              onClick={(e) => {
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick();
                }
                setOpen(false);
              }}
              className="block rounded-md px-3 py-2 text-sm text-popover-foreground hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
