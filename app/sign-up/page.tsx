import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = {
  title: "Create account",
  robots: { index: false },
};

type PageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function SignUpPage({ searchParams }: PageProps) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/";

  if (session?.user) {
    redirect(callbackUrl);
  }

  return (
    <AuthShell
      title="Join Street Voice"
      subtitle="Create a free account to read the latest digital edition."
    >
      <Suspense fallback={<p className="text-center text-sm text-muted">Loading…</p>}>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
