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

  // ── Categories ─────────────────────────────────────────────
  const categoriesData = [
    {
      name: "Industrial Safety",
      slug: "industrial-safety",
      description: "High-performance protection for manufacturing, construction, and heavy industry.",
    },
    {
      name: "Medical & Healthcare",
      slug: "medical-healthcare",
      description: "Sterile and non-sterile examination gloves meeting international health standards.",
    },
    {
      name: "Chemical Resistant",
      slug: "chemical-resistant",
      description: "Specialized barrier protection against hazardous substances and solvents.",
    },
    {
      name: "Food Processing",
      slug: "food-processing",
      description: "FDA-compliant gloves designed for safe and hygienic food handling.",
    },
  ];

  const categories = await Promise.all(
    categoriesData.map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: { ...cat, isVisible: true },
      })
    )
  );

  const industrialCat = categories.find((c) => c.slug === "industrial-safety")!;
  const medicalCat = categories.find((c) => c.slug === "medical-healthcare")!;

  // ── Products (DEMO CONTENT) ──────────────────────────────
  const demoProducts = [
    {
      name: "Pro-Grip Nitrile Coated Safety Gloves",
      slug: "pro-grip-nitrile-coated",
      sku: "DEMO-IND-001",
      shortDescription: "[DEMO] ANSI Cut Level A3 nitrile-coated industrial gloves.",
      longDescription:
        "NOTE: THIS IS DEMO CONTENT. The Pro-Grip series provides excellent manual dexterity and a secure grip in oily conditions. Designed for assembly lines and general maintenance.\n\nKey Performance Characteristics:\n- High abrasion resistance for extended wear life.\n- Breathable liner ensures comfort during long shifts.\n- Ergonomic design reduces hand fatigue.",
      material: "HPPE / Glass Fiber",
      coating: "Sandy Nitrile",
      protectionLevel: "ANSI Cut A3, EN388 4X42C",
      applications: ["Automotive", "Metal Fabrication", "Glass Handling", "Assembly"],
      features: ["Breathable back", "Reinforced thumb crotch", "Oeko-Tex certified", "Touchscreen compatible"],
      colors: ["High-viz Yellow", "Gray", "Black"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      stockStatus: "IN_STOCK",
      isFeatured: true,
      status: "PUBLISHED",
      categoryId: industrialCat.id,
      seoTitle: "Pro-Grip Nitrile Coated Industrial Gloves | Demo",
      seoDescription: "High-performance nitrile coated safety gloves for industrial applications. [Demo Content]",
    },
    {
      name: "Safe-Touch Blue Nitrile Exam Gloves",
      slug: "safe-touch-nitrile-exam",
      sku: "DEMO-MED-002",
      shortDescription: "[DEMO] Powder-free medical grade nitrile examination gloves.",
      longDescription:
        "NOTE: THIS IS DEMO CONTENT. Safe-Touch exam gloves offer superior barrier protection and puncture resistance. 100% latex-free to prevent allergic reactions. Ideal for healthcare environments requiring high sensitivity.\n\nStandards Compliance:\n- FDA 510(k) cleared.\n- Meets ASTM D6319 and EN 455 standards.",
      material: "100% Synthetic Nitrile",
      coating: "None (Polymer coated interior)",
      protectionLevel: "ASTM D6319, EN 455",
      applications: ["Medical", "Dental", "Laboratory", "Tattooing", "Food Handling"],
      features: ["Powder-free", "Beaded cuff", "Textured fingertips", "Ambidextrous"],
      colors: ["Medical Blue", "Violet", "Black", "White"],
      sizes: ["XS", "S", "M", "L", "XL"],
      stockStatus: "IN_STOCK",
      isFeatured: true,
      status: "PUBLISHED",
      categoryId: medicalCat.id,
      seoTitle: "Safe-Touch Medical Grade Nitrile Exam Gloves | Demo",
      seoDescription: "Premium medical grade nitrile examination gloves, powder-free and latex-free. [Demo Content]",
    },
    {
      name: "Thermal-Shield Heat Resistant Gloves",
      slug: "thermal-shield-heat-resistant",
      sku: "DEMO-IND-003",
      shortDescription: "[DEMO] Heat-resistant Kevlar blend gloves for high-temp environments.",
      longDescription:
        "NOTE: THIS IS DEMO CONTENT. Engineered for protection up to 250°C (480°F) contact heat. Durable and comfortable for extended wear in foundries and commercial kitchens.\n\nAdvanced Thermal Protection:\n- Double-layered Kevlar construction.\n- Extended cuff for wrist and forearm protection.",
      material: "Kevlar / Para-aramid",
      coating: "Uncoated",
      protectionLevel: "EN407 Level 2 Contact Heat",
      applications: ["Foundry", "Welding", "Industrial Kitchens", "Steel Mill"],
      features: ["Flame resistant", "Double-layered", "Extra-long cuff", "Cut resistant"],
      colors: ["Natural Yellow"],
      sizes: ["M", "L", "XL"],
      stockStatus: "MADE_TO_ORDER",
      isFeatured: false,
      status: "PUBLISHED",
      categoryId: industrialCat.id,
      seoTitle: "Thermal-Shield Heat Resistant Kevlar Gloves | Demo",
      seoDescription: "Professional grade heat-resistant gloves for extreme temperature environments. [Demo Content]",
    },
  ];

  for (const product of demoProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product as any,
        specifications: {
          create: [
            { label: "Standard", value: "Demo Certified" },
            { label: "Washable", value: "Up to 5 times" },
          ],
        },
      },
    });
  }

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
        headline: "Premium Uniform Solutions for a Professional World",
        subheadline:
          "ISO-certified manufacturing, exporting to 40+ countries with rigorous quality assurance and design excellence.",
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
          { label: "Uniforms Produced Annually", value: 50000000 },
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
        "MOQ varies by product, typically starting at 500 units. Contact our export team for exact figures on your product of interest.",
      sortOrder: 1,
    },
    {
      question: "Do you offer custom branding and embroidery?",
      answer:
        "Yes, private labeling, custom embroidery, and branded packaging are available for orders above the standard MOQ.",
      sortOrder: 2,
    },
    {
      question: "What certifications do your products carry?",
      answer:
        "Our products are manufactured under ISO 9001 and meet international workwear standards, with product-specific certifications available on request.",
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
