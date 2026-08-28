import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@yourdomain.com";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL;

// IMPORTANT — the Resend SDK does NOT throw on API-level failures (invalid
// key, unverified domain, recipient not allowed, etc). It resolves
// successfully with `{ data: null, error: {...} }`. Every call site in this
// file used to ignore `error` entirely, so a failed send looked identical
// to a successful one — nothing was logged, nothing surfaced anywhere,
// and better-auth's callbacks (sendVerificationEmail / sendPasswordResetEmail)
// happily reported success even though no email ever left Resend.
//
// This wrapper makes failures visible (server console) and re-throws so
// callers/logs reflect what actually happened instead of silently
// swallowing it.
async function send(params: Parameters<typeof resend.emails.send>[0]) {
  const { data, error } = await resend.emails.send(params);
  if (error) {
    console.error(`[resend] send failed (to: ${String((params as { to?: unknown }).to)}, subject: "${params.subject}"):`, error);
    throw new Error(`Failed to send email: ${error.message ?? error.name ?? "unknown error"}`);
  }
  return data;
}

export async function sendVerificationEmail(to: string, url: string) {
  return send({
    from: FROM,
    to,
    subject: "Verify your email address",
    html: `<p>Welcome. Please verify your email by clicking <a href="${url}">this link</a>.</p>`,
  });
}

export async function sendPasswordResetEmail(to: string, url: string) {
  return send({
    from: FROM,
    to,
    subject: "Reset your password",
    html: `<p>Click <a href="${url}">here</a> to reset your password. If you didn't request this, ignore this email.</p>`,
  });
}

export async function sendRfqReceivedEmail(to: string, refNo: string) {
  return send({
    from: FROM,
    to,
    subject: `Quotation request received — ${refNo}`,
    html: `<p>Thank you for your request for quotation (${refNo}). Our team will review it and respond shortly.</p>`,
  });
}

export async function notifyAdminNewRfq(refNo: string, companyName: string) {
  if (!ADMIN_EMAIL) return;
  return send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New RFQ received — ${refNo}`,
    html: `<p>A new request for quotation was submitted by <strong>${companyName}</strong>. Reference: ${refNo}.</p>`,
  });
}

export async function sendContactAutoReply(to: string) {
  return send({
    from: FROM,
    to,
    subject: "We received your message",
    html: `<p>Thanks for reaching out. Our team typically responds within 1 business day.</p>`,
  });
}
