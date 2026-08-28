import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ── Super Admin ────────────────────────────────────────────
  // Deliberately NOT creating a User row here. Better Auth owns credential
  // storage (the `accounts` table holds the hashed password), so a user
  // inserted directly via prisma.user.create() has no password and can't
  // sign in. Instead: register a normal account at /register, then run
  //   pnpm promote:admin you@example.com
  // See scripts/promote-admin.ts for details.

  // ── Sample category & product ─────────────────────────────
  const category = await prisma.category.upsert({
    where: { slug: "industrial-safety-gloves" },
    update: {},
    create: {
      name: "Industrial Safety Gloves",
      slug: "industrial-safety-gloves",
      description: "Cut-resistant and heavy-duty gloves for industrial applications.",
      isVisible: true,
      sortOrder: 1,
    },
  });

  await prisma.product.upsert({
    where: { slug: "cut-resistant-nitrile-gloves" },
    update: {},
    create: {
      name: "Cut-Resistant Nitrile Coated Gloves",
      slug: "cut-resistant-nitrile-gloves",
      sku: "GLV-NIT-001",
      shortDescription: "ANSI Cut Level A4 nitrile-coated safety gloves.",
      longDescription:
        "Engineered for demanding industrial environments, offering superior grip, abrasion resistance, and cut protection without sacrificing dexterity.",
      material: "Nitrile / HPPE blend",
      application: "Manufacturing, Logistics, Construction",
      color: ["Black", "Gray"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      packaging: "12 pairs / bag, 12 bags / carton",
      moq: "5,000 pairs",
      weight: "45g per pair",
      stockStatus: "IN_STOCK",
      isFeatured: true,
      status: "PUBLISHED",
      categoryId: category.id,
      seoTitle: "Cut-Resistant Nitrile Coated Gloves | ANSI A4",
      seoDescription:
        "Industrial-grade cut-resistant nitrile coated gloves, ANSI A4 rated, manufactured for global export.",
      seoKeywords: ["cut resistant gloves", "nitrile coated gloves", "industrial safety gloves"],
    },
  });

  // ── Homepage CMS defaults ──────────────────────────────────
  const sections: {
    key: "HERO" | "STATISTICS" | "FEATURED_PRODUCTS" | "TESTIMONIALS" | "FAQ" | "CTA";
    content: object;
    sortOrder: number;
  }[] = [
    {
      key: "HERO",
      sortOrder: 1,
      content: {
        headline: "Precision-Engineered Gloves for a Safer World",
        subheadline:
          "ISO-certified manufacturing, exporting to 40+ countries with rigorous quality assurance.",
        ctaPrimary: { label: "Explore Products", href: "/products" },
        ctaSecondary: { label: "Request a Quotation", href: "/request-quote" },
      },
    },
    {
      key: "STATISTICS",
      sortOrder: 2,
      content: {
        items: [
          { label: "Countries Served", value: 40 },
          { label: "Years of Experience", value: 20 },
          { label: "Gloves Produced Annually", value: 50000000 },
          { label: "Quality Certifications", value: 12 },
        ],
      },
    },
    {
      key: "FEATURED_PRODUCTS",
      sortOrder: 3,
      content: {}, // data-driven — pulled live from the Product table
    },
    {
      key: "TESTIMONIALS",
      sortOrder: 4,
      content: {}, // data-driven — pulled live from the Testimonial table
    },
    {
      key: "FAQ",
      sortOrder: 5,
      content: {}, // data-driven — pulled live from the FaqItem table
    },
    {
      key: "CTA",
      sortOrder: 6,
      content: {
        headline: "Ready to discuss your requirements?",
        subheadline:
          "Our export team responds to quotation requests within one business day.",
        cta: { label: "Request a Quotation", href: "/request-quote" },
      },
    },
  ];

  for (const section of sections) {
    await prisma.homepageSection.upsert({
      where: { key: section.key },
      update: {},
      create: { key: section.key, content: section.content, sortOrder: section.sortOrder },
    });
  }

  // ── Sample FAQ items ────────────────────────────────────────
  const faqs = [
    {
      question: "What is your minimum order quantity (MOQ)?",
      answer:
        "MOQ varies by product, typically starting at 5,000 pairs. Contact our export team for exact figures on your product of interest.",
      sortOrder: 1,
    },
    {
      question: "Do you offer custom branding and packaging?",
      answer:
        "Yes, private labeling, custom packaging, and branded catalogues are available for orders above the standard MOQ.",
      sortOrder: 2,
    },
    {
      question: "What certifications do your products carry?",
      answer:
        "Our products are manufactured under ISO 9001, ISO 13485, and CE certification, with product-specific certifications available on request.",
      sortOrder: 3,
    },
  ];

  for (const faq of faqs) {
    const existing = await prisma.faqItem.findFirst({ where: { question: faq.question } });
    if (!existing) {
      await prisma.faqItem.create({ data: faq });
    }
  }

  // ── Sample testimonial ──────────────────────────────────────
  const existingTestimonial = await prisma.testimonial.findFirst({
    where: { customerName: "James Whitfield" },
  });
  if (!existingTestimonial) {
    await prisma.testimonial.create({
      data: {
        customerName: "James Whitfield",
        companyName: "Whitfield Industrial Supply",
        country: "United Kingdom",
        rating: 5,
        review:
          "Consistent quality across every shipment and a responsive export team — exactly what we need from a long-term manufacturing partner.",
        isApproved: true,
        isFeatured: true,
      },
    });
  }

  console.log("Seed complete. Register an account, then run: pnpm promote:admin <email>");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
