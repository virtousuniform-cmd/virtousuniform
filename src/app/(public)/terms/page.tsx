import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing use of our website and services.",
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        description="Last updated: this template should be reviewed by counsel before launch."
      />
      <div className="prose prose-neutral mx-auto max-w-3xl px-6 py-16 text-foreground">
        <Section title="1. Acceptance of Terms">
          By accessing or using this website, you agree to be bound by these Terms of
          Service. If you do not agree, please do not use the site.
        </Section>
        <Section title="2. Use of the Website">
          This website is provided for the purpose of browsing our product catalog,
          submitting requests for quotation, and communicating with our team. You agree
          not to misuse the site, attempt unauthorized access to any system, or submit
          false information through our forms.
        </Section>
        <Section title="3. Quotations & Orders">
          Product information, pricing indications, and lead times displayed on this
          website are estimates. All orders are subject to a formal quotation and written
          agreement between the customer and our company before production begins. MOQ,
          pricing, and delivery terms will be confirmed in writing for each order.
        </Section>
        <Section title="4. Intellectual Property">
          All content on this website — including product images, descriptions, logos,
          and written material — is the property of our company or its licensors and may
          not be reproduced without written permission.
        </Section>
        <Section title="5. Account Responsibility">
          If you create an account, you are responsible for maintaining the
          confidentiality of your credentials and for all activity under your account.
        </Section>
        <Section title="6. Limitation of Liability">
          This website and its content are provided "as is" without warranties of any
          kind. We are not liable for indirect, incidental, or consequential damages
          arising from use of the site, to the fullest extent permitted by law.
        </Section>
        <Section title="7. Governing Law">
          These terms are governed by the laws of the jurisdiction in which our company
          is registered, without regard to conflict-of-law principles.
        </Section>
        <Section title="8. Changes to These Terms">
          We may update these terms from time to time. Continued use of the site after
          changes constitutes acceptance of the updated terms.
        </Section>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{children}</p>
    </section>
  );
}
