import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AuditAction } from "@prisma/client";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR"] as const;

export class UnauthorizedError extends Error {
  constructor(message = "You are not authorized to perform this action.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Verifies the caller has an admin-tier role and returns the session.
 * Call this at the top of EVERY admin Server Action — middleware alone
 * is not a sufficient authorization boundary.
 */
export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user ? (session.user as { role?: string }).role : undefined;

  if (!session || !role || !ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) {
    throw new UnauthorizedError();
  }

  return session;
}

/**
 * Stricter than requireAdmin — reserved for actions that can escalate
 * privileges (granting/revoking admin roles) or otherwise affect account
 * access. Regular ADMIN and EDITOR roles cannot call these.
 */
export async function requireSuperAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user ? (session.user as { role?: string }).role : undefined;

  if (!session || role !== "SUPER_ADMIN") {
    throw new UnauthorizedError("Only a super admin can perform this action.");
  }

  return session;
}

export async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new UnauthorizedError("You must be signed in.");
  return session;
}

export async function logAudit(params: {
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata as any,
    },
  });
}
