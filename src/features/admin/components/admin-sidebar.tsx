"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  UserCircle,
  FileText,
  MessageSquare,
  Bell,
  Newspaper,
  ImageIcon,
  Award,
  LayoutTemplate,
  Search,
  BarChart3,
  Settings,
  ScrollText,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_SECTIONS: {
  label: string;
  items: { href: string; label: string; icon: React.ElementType }[];
}[] = [
  {
    label: "General",
    items: [{ href: "/admin", label: "Overview", icon: LayoutDashboard }],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/customers", label: "Customers", icon: UserCircle },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/rfqs", label: "RFQs", icon: FileText },
      { href: "/admin/messages", label: "Messages", icon: MessageSquare },
      { href: "/admin/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/blogs", label: "Blog", icon: Newspaper },
      { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
      { href: "/admin/certificates", label: "Certifications", icon: Award },
      { href: "/admin/testimonials", label: "Testimonials", icon: Star },
      { href: "/admin/cms", label: "Homepage CMS", icon: LayoutTemplate },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/seo", label: "SEO", icon: Search },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/settings", label: "Settings", icon: Settings },
      { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
      <div className="flex h-14 items-center border-b border-border px-5">
        <Link href="/admin" className="font-semibold text-foreground">
          Gloves<span className="text-primary">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-1 px-2 text-xs font-medium text-muted-foreground uppercase">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
