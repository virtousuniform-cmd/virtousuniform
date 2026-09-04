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
        slides: [
          {
            image: "https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=2074&auto=format&fit=crop",
            headline: "Elevating Professional Standards",
            subheadline: "Custom-tailored uniform solutions for global industries, blending safety with unparalleled style."
          },
          {
            image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop",
            headline: "Precision Manufacturing",
            subheadline: "Every stitch reflects our commitment to quality, ensuring durability and comfort in every garment."
          },
          {
            image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop",
            headline: "Global Export Excellence",
            subheadline: "Serving diverse sectors across 40+ countries with reliable, ISO-certified professional workwear."
          }
        ]
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

  // ── Custom Pages (CMS) ────────────────────────────────────
  const pages = [
    {
      title: "About Us",
      slug: "about",
      content: `
        <div class="space-y-12">
          <section class="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">Built on a Legacy of Excellence</h2>
              <p class="text-lg text-muted-foreground leading-relaxed">
                For over two decades, Virtous Uniform has been at the forefront of professional garment manufacturing. What started as a local family-owned workshop has evolved into a global powerhouse, serving leading corporations and government institutions in over 40 countries.
              </p>
              <p class="mt-4 text-lg text-muted-foreground leading-relaxed">
                Our philosophy is simple: Quality is not an act, it is a habit. We combine traditional craftsmanship with state-of-the-art automation to deliver products that don't just meet standards, but set them.
              </p>
            </div>
            <div class="relative aspect-video overflow-hidden rounded-2xl bg-muted shadow-2xl">
              <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop" class="object-cover" alt="Our Facility" />
            </div>
          </section>

          <div class="grid gap-8 sm:grid-cols-3 border-y border-border py-12">
            <div class="text-center">
              <div class="text-4xl font-bold text-brand mb-2">20+</div>
              <div class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Years Experience</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-brand mb-2">40+</div>
              <div class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Global Markets</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-brand mb-2">1M+</div>
              <div class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Units Monthly</div>
            </div>
          </div>

          <section>
            <h2 class="text-3xl font-bold tracking-tight text-center mb-12">Our Core Values</h2>
            <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div class="p-8 rounded-2xl bg-card border border-border hover:border-brand transition-colors">
                <h3 class="text-xl font-bold mb-3">Integrity</h3>
                <p class="text-muted-foreground">We believe in transparent business practices and building long-term trust with our partners worldwide.</p>
              </div>
              <div class="p-8 rounded-2xl bg-card border border-border hover:border-brand transition-colors">
                <h3 class="text-xl font-bold mb-3">Innovation</h3>
                <p class="text-muted-foreground">Continuously investing in fabric technology and ergonomic designs to ensure safety and comfort.</p>
              </div>
              <div class="p-8 rounded-2xl bg-card border border-border hover:border-brand transition-colors">
                <h3 class="text-xl font-bold mb-3">Sustainability</h3>
                <p class="text-muted-foreground">Committed to ethical manufacturing and reducing our environmental footprint through efficient production.</p>
              </div>
            </div>
          </section>
        </div>
      `,
      status: "PUBLISHED",
      seoTitle: "About Virtous Uniform | Global Leader in Professional Workwear",
      seoDescription: "Learn about our 20-year legacy of manufacturing high-quality industrial, medical, and professional uniforms for clients in 40+ countries."
    },
    {
      title: "Manufacturing Process",
      slug: "manufacturing",
      content: `
        <div class="space-y-16">
          <header class="max-w-3xl">
            <h2 class="text-3xl font-bold tracking-tight sm:text-4xl mb-6">Precision Engineering at Scale</h2>
            <p class="text-lg text-muted-foreground leading-relaxed">
              Our vertically integrated manufacturing process allows us to maintain total quality control, from raw fabric inspection to final garment finishing.
            </p>
          </header>

          <div class="grid gap-12">
            <div class="flex flex-col md:flex-row gap-8 items-center">
              <div class="md:w-1/2">
                <div class="text-xs font-bold text-brand uppercase tracking-widest mb-2">Step 01</div>
                <h3 class="text-2xl font-bold mb-4">Fabric R&D & Sourcing</h3>
                <p class="text-muted-foreground">We source only premium, certified fibers. Our lab tests for tensile strength, color fastness, and protection ratings before any cutting begins.</p>
              </div>
              <div class="md:w-1/2 aspect-video rounded-xl overflow-hidden bg-muted">
                <img src="https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?q=80&w=2070&auto=format&fit=crop" class="object-cover" alt="Fabric testing" />
              </div>
            </div>

            <div class="flex flex-col md:flex-row-reverse gap-8 items-center">
              <div class="md:w-1/2">
                <div class="text-xs font-bold text-brand uppercase tracking-widest mb-2">Step 02</div>
                <h3 class="text-2xl font-bold mb-4">Precision Auto-Cutting</h3>
                <p class="text-muted-foreground">Using advanced CAD/CAM systems and automated cutting tables, we ensure 100% pattern accuracy and minimal fabric waste.</p>
              </div>
              <div class="md:w-1/2 aspect-video rounded-xl overflow-hidden bg-muted">
                <img src="https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=2070&auto=format&fit=crop" class="object-cover" alt="Precision cutting" />
              </div>
            </div>

            <div class="flex flex-col md:flex-row gap-8 items-center">
              <div class="md:w-1/2">
                <div class="text-xs font-bold text-brand uppercase tracking-widest mb-2">Step 03</div>
                <h3 class="text-2xl font-bold mb-4">Specialized Stitching</h3>
                <p class="text-muted-foreground">Our assembly lines utilize heavy-duty industrial machines managed by master tailors with decades of experience in technical workwear.</p>
              </div>
              <div class="md:w-1/2 aspect-video rounded-xl overflow-hidden bg-muted">
                <img src="https://images.unsplash.com/photo-1525909002-1b05f0c869d8?q=80&w=2070&auto=format&fit=crop" class="object-cover" alt="Garment stitching" />
              </div>
            </div>
          </div>
        </div>
      `,
      status: "PUBLISHED",
      seoTitle: "Modern Manufacturing Process | Virtous Uniform Co.",
      seoDescription: "Explore our state-of-the-art production line, from CAD design and automated cutting to specialized technical stitching."
    },
    {
      title: "Quality Standards",
      slug: "quality",
      content: `
        <div class="space-y-12">
          <div class="p-12 rounded-3xl bg-brand text-brand-foreground shadow-2xl">
            <h2 class="text-3xl font-bold mb-6">Zero Tolerance for Defects</h2>
            <p class="text-xl leading-relaxed opacity-90">
              Our quality assurance team operates as an independent body within the factory. Every single unit produced at Virtous Uniform undergoes a 12-point inspection process.
            </p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <div class="p-8 border border-border rounded-2xl hover:bg-card transition-colors">
              <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
                <span class="size-2 rounded-full bg-brand"></span>
                In-Line Inspection
              </h3>
              <p class="text-muted-foreground">Quality controllers are stationed at every 5 machines to catch and rectify stitching errors immediately during the assembly phase.</p>
            </div>
            <div class="p-8 border border-border rounded-2xl hover:bg-card transition-colors">
              <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
                <span class="size-2 rounded-full bg-brand"></span>
                Standard Compliance
              </h3>
              <p class="text-muted-foreground">We strictly adhere to ISO 9001:2015, ensuring our management systems and production outputs meet international rigor.</p>
            </div>
          </div>

          <section class="bg-muted/50 rounded-2xl p-12 text-center">
            <h2 class="text-2xl font-bold mb-4">Request Our Certificates</h2>
            <p class="text-muted-foreground mb-8 max-w-lg mx-auto">We provide full documentation for all our test results and certifications to our wholesale partners.</p>
            <a href="/contact" class="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">Contact Compliance Team</a>
          </section>
        </div>
      `,
      status: "PUBLISHED",
      seoTitle: "Quality Assurance & Certifications | Virtous Uniform",
      seoDescription: "Learn about our rigorous 12-point quality inspection and our compliance with global safety and manufacturing standards."
    },
  ];

  for (const page of pages) {
    await prisma.contentPage.upsert({
      where: { slug: page.slug },
      update: { ...page as any },
      create: { ...page as any },
    });
  }

  // ── Featured Categories for Home ─────────────────────────
  await prisma.category.updateMany({
    where: { slug: { in: ["industrial-safety", "medical-healthcare", "chemical-resistant"] } },
    data: { isFeaturedOnHome: true, isVisible: true },
  });

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
