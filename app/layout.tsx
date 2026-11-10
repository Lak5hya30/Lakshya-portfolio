import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { content } from "@/content";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const sans = Manrope({ variable: "--font-sans", subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const description = "Portfolio of Lakshya Gupta, a backend-leaning full-stack developer at NIT Jalandhar seeking SDE internship opportunities.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Lakshya Gupta — Software Developer",
  description,
  keywords: ["Lakshya Gupta", "software developer", "SDE intern", "NIT Jalandhar", "full-stack developer", "backend developer"],
  authors: [{ name: "Lakshya Gupta", url: siteUrl }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Lakshya Gupta — Software Developer",
    description: "Backend-leaning full-stack developer building web and Python systems.",
    type: "profile",
    url: "/",
    siteName: "Lakshya Gupta",
  },
  twitter: { card: "summary_large_image", title: "Lakshya Gupta — Software Developer", description: "Backend-leaning full-stack developer building web and Python systems." },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: content.person.name,
  jobTitle: content.person.role,
  description: content.person.summary,
  email: `mailto:${content.person.email}`,
  url: siteUrl,
  alumniOf: { "@type": "CollegeOrUniversity", name: content.education.school },
  knowsAbout: content.skills.flatMap((group) => group.values),
  sameAs: content.links.map((link) => link.href),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema).replace(/</g, "\\u003c") }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
