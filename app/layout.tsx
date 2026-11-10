import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { AnalyticsListener } from "@/components/analytics";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const sans = Manrope({ variable: "--font-sans", subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const description =
  "Lakshya Gupta is a software developer at NIT Jalandhar building backend systems, full-stack applications and Python/AI projects. Explore selected work, experience and résumé.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Lakshya Gupta — Software Developer | Backend, Full-Stack & AI", template: "%s — Lakshya Gupta" },
  description,
  keywords: ["Lakshya Gupta", "software developer", "SDE intern", "NIT Jalandhar", "full-stack developer", "backend developer", "Python"],
  authors: [{ name: "Lakshya Gupta", url: siteUrl }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Lakshya Gupta — Software Developer | Backend, Full-Stack & AI",
    description,
    type: "profile",
    url: "/",
    siteName: "Lakshya Gupta",
  },
  twitter: { card: "summary_large_image", title: "Lakshya Gupta — Software Developer", description },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

const stripHostInjections = `(function(){var h=document.head,n=h.firstChild,x;while(n){x=n.nextSibling;if((n.nodeType===3&&!n.data.trim())||(n.nodeType===8&&/hosted on Netlify/i.test(n.data)))h.removeChild(n);n=x}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <head>
        {/* Some hosts (Netlify) inject a comment and line breaks into <head>; React treats the stray text as a
            hydration mismatch and re-renders the whole page. Remove them before React hydrates. */}
        <script dangerouslySetInnerHTML={{ __html: stripHostInjections }} />
      </head>
      <body>
        {children}
        <AnalyticsListener />
      </body>
    </html>
  );
}
