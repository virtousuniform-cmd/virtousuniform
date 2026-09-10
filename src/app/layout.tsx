import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import { settingsRepository } from "@/features/settings/repositories/settings.repository";
import { SITE_URL } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Bold, slightly technical display face for headlines — paired with
// Inter for body copy so headings get real presence instead of just
// being larger body text. Loaded with the same `display: swap` strategy
// as Inter so it never blocks first paint.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const seo = await settingsRepository.getSeoDefaults();

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: seo.siteTitle,
      template: seo.titleTemplate,
    },
    description: seo.defaultDescription,
    alternates: {
      canonical: "/",
    },
    icons: {
      icon: "/icon.svg",
      shortcut: "/icon.svg",
    },
    openGraph: {
      type: "website",
      siteName: "Virtuous Uniform",
      url: "/",
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        {children}
        <Toaster richColors position="top-right" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
