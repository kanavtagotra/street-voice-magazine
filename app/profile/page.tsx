import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfilePanel } from "@/components/auth/ProfilePanel";
import { Container } from "@/components/layout/Container";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Your profile",
  robots: { index: false },
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?callbackUrl=/profile");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="py-12 sm:py-16">
        <Container className="max-w-2xl">
          <ProfilePanel user={session.user} />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
