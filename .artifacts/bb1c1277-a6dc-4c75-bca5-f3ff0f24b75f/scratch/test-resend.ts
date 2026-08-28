import { Resend } from "resend";
import * as dotenv from "dotenv";
import path from "path";

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.RESEND_FROM_EMAIL;
const to = process.env.ADMIN_NOTIFICATION_EMAIL;

console.log("Configuration:");
console.log("- API Key (first 5 chars):", process.env.RESEND_API_KEY?.substring(0, 5));
console.log("- From:", from);
console.log("- To:", to);

async function test() {
  if (!process.env.RESEND_API_KEY) {
    console.error("Error: RESEND_API_KEY is missing from .env");
    return;
  }

  console.log("\nAttempting to send test email...");
  try {
    const { data, error } = await resend.emails.send({
      from: from || "onboarding@resend.dev",
      to: to || "delivered@resend.dev", // Resend test recipient if admin email is missing
      subject: "Test Email from GloVe Platform",
      html: "<p>This is a test email to verify Resend configuration.</p>",
    });

    if (error) {
      console.error("Resend API Error:", error);
    } else {
      console.log("Success! Email sent. ID:", data?.id);
    }
  } catch (err) {
    console.error("Unexpected Error:", err);
  }
}

test();
