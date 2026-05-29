import type { Metadata } from "next";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: `Read Magazine`,
  description: `Protected online reader for ${siteConfig.name}.`,
  robots: { index: false, follow: false },
};

export default function ReadLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
