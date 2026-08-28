import type { Metadata } from "next";
import { certificateRepository } from "@/features/certifications/repositories/certificate.repository";
import { UploadCertificateForm } from "@/features/certifications/components/upload-certificate-form";
import { CertificatesGrid } from "@/features/certifications/components/certificates-grid";

export const metadata: Metadata = { title: "Certifications — Admin" };

export default async function AdminCertificatesPage() {
  const certificates = await certificateRepository.findAll();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Certifications</h1>
        <p className="text-sm text-muted-foreground">
          {certificates.length} certificate{certificates.length === 1 ? "" : "s"}
        </p>
      </div>

      <UploadCertificateForm />

      {certificates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No certificates uploaded yet.</p>
        </div>
      ) : (
        <CertificatesGrid certificates={certificates} />
      )}
    </div>
  );
}
