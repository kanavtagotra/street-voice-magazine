import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = {
  title: "Create account",
  robots: { index: false },
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Join Street Voice"
      subtitle="Create a free account to read the latest digital edition."
    >
      <SignupForm />
    </AuthShell>
  );
}
