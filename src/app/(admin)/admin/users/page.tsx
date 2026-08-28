import { headers } from "next/headers";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { userRepository } from "@/features/users/repositories/user.repository";
import { RoleSelect } from "@/features/users/components/role-select";
import { ActiveToggle } from "@/features/users/components/active-toggle";
import { PromoteUserSearch } from "@/features/users/components/promote-user-search";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Users — Admin" };

export default async function AdminUsersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isSuperAdmin = (session!.user as { role?: string }).role === "SUPER_ADMIN";
  const staff = await userRepository.findStaff();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground">
          {staff.length} staff member{staff.length === 1 ? "" : "s"} — Super Admin, Admin, and
          Editor roles.
        </p>
      </div>

      {isSuperAdmin && <PromoteUserSearch />}

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <RoleSelect
                    userId={user.id}
                    currentRole={user.role}
                    disabled={!isSuperAdmin}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell>
                  <ActiveToggle userId={user.id} isActive={user.isActive} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {!isSuperAdmin && (
        <p className="text-xs text-muted-foreground">
          Only a Super Admin can change roles or search for users to promote.
        </p>
      )}
    </div>
  );
}
