/**
 * Promotes an existing, already-registered user to SUPER_ADMIN.
 *
 * Why this script exists: Better Auth owns credential storage (the
 * `accounts` table holds the hashed password), so a user created directly
 * via `prisma.user.create()` — like the one in prisma/seed.ts — has no
 * password and can't sign in. The correct flow for your first admin is:
 *
 *   1. Run the app and register a normal account at /register
 *      (this creates both the `users` row AND the `accounts` row with a
 *      real hashed password via Better Auth).
 *   2. Verify that account's email (check the console/Resend logs for the
 *      verification link in development).
 *   3. Run this script with that email to promote it to SUPER_ADMIN:
 *
 *        pnpm promote:admin you@example.com
 *
 * Usage:
 *   pnpm promote:admin <email>
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: pnpm promote:admin <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(
      `No user found with email "${email}". Register at /register first, then run this script.`,
    );
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { role: "SUPER_ADMIN", emailVerified: true },
  });

  console.log(`✔ ${updated.email} is now SUPER_ADMIN.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
