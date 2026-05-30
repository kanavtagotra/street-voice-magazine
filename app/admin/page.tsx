import { auth } from "@/auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminPortal } from "@/components/admin/AdminPortal";
import { ToastProvider } from "@/components/admin/ToastProvider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import Link from "next/link";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border bg-background/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
            <Link href="/" className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
              Street Voice
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
          {isAdmin ? (
            <AdminPortal />
          ) : (
            <div className="mx-auto max-w-lg space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-semibold">Admin login</h1>
                <p className="mt-2 text-sm text-muted">
                  Sign in to upload and manage magazine PDFs.
                </p>
              </div>
              <AdminLoginForm />
            </div>
          )}
        </main>
      </div>
    </ToastProvider>
  );
}
