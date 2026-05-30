export const readRoute = "/read";

export const navLinks = [
  { label: "Home", href: "/#home" },
  { label: "Latest Edition", href: "/#latest" },
  { label: "Archive", href: "/archive" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
] as const;

export const archiveNotice =
  "Browse every previously uploaded edition in the archive. The latest active issue appears on the home page automatically.";

export const socialLinks = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "X", href: "https://x.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "YouTube", href: "https://youtube.com" },
] as const;

export const siteConfig = {
  name: "Street Voice Magazine",
  shortName: "Street Voice",
  heroHeadline: "Giving Voice To The Streets",
  tagline:
    "Modern perspectives from India's streets to the national stage.",
  description:
    "Street Voice Magazine is a premium editorial platform covering contemporary India through deep reportage, interviews, and curated stories from Jammu & Kashmir to the national stage.",
  email: "hello@streetvoice.in",
  phone: "+91 99000 00000",
  location: "Jammu & Kashmir, India",
} as const;
