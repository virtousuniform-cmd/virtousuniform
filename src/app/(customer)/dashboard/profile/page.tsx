import { headers } from "next/headers";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/features/dashboard/components/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = await prisma.user.findUnique({ where: { id: session!.user.id } });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Keep your contact details current — this is what our team sees on your requests.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaultValues={{
              name: user!.name,
              phone: user!.phone ?? "",
              companyName: user!.companyName ?? "",
              country: user!.country ?? "",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email address</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground">{user!.email}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Contact support to change the email associated with your account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
