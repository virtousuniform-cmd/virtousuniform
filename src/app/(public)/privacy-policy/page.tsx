import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How we collect, use, and protect your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description="Last updated: this template should be reviewed by counsel before launch."
      />
      <div className="prose prose-neutral mx-auto max-w-3xl px-6 py-16 text-foreground">
        <Section title="1. Information We Collect">
          We collect information you provide directly, such as your name, email address,
          phone number, company details, and any content submitted through our contact
          and quotation request forms. We also collect standard technical data (IP address,
          browser type, pages visited) through analytics tools for security and performance
          purposes.
        </Section>
        <Section title="2. How We Use Your Information">
          We use the information you provide to respond to inquiries, process quotation
          requests, manage your account, send transactional emails (order updates,
          password resets), and improve our website and services. We do not sell your
          personal information to third parties.
        </Section>
        <Section title="3. Data Storage & Security">
          Your data is stored using industry-standard hosting and database providers with
          encryption in transit and at rest. Access to customer data is restricted to
          authorized personnel who need it to perform their duties.
        </Section>
        <Section title="4. Cookies">
          We use essential cookies to keep you signed in and remember your preferences.
          Analytics cookies help us understand site usage; you can control cookie
          preferences through your browser settings.
        </Section>
        <Section title="5. Your Rights">
          You may request access to, correction of, or deletion of your personal data at
          any time by contacting us. If you are located in a jurisdiction with specific
          data protection laws (such as the GDPR), you may have additional rights under
          those laws.
        </Section>
        <Section title="6. Third-Party Services">
          We use trusted third-party services for hosting, email delivery, and analytics.
          These providers only receive the data necessary to perform their function and
          are contractually obligated to protect it.
        </Section>
        <Section title="7. Contact">
          Questions about this policy can be directed to our team via the Contact page.
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
