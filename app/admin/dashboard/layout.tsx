import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/admin/DashboardShell";

export const metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/dashboard");
  }
  if (session.user.role !== "admin") {
    redirect("/");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
