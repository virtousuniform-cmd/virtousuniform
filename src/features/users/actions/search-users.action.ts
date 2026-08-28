"use server";

import { requireSuperAdmin, UnauthorizedError } from "@/lib/auth-guards";
import { userRepository } from "../repositories/user.repository";

type ActionResult =
  | { success: true; data: { id: string; name: string; email: string; role: string }[] }
  | { success: false; error: string };

export async function searchUsersAction(query: string): Promise<ActionResult> {
  try {
    await requireSuperAdmin();
    const results = await userRepository.searchAll(query);
    return { success: true, data: results };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { success: false, error: err.message };
    console.error("searchUsersAction failed", err);
    return { success: false, error: "Search failed." };
  }
}
