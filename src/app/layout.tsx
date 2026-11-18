import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SiteTracker from "@/components/SiteTracker";
import { SITE_URL, OG_IMAGE } from "@/lib/seo";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const HOME_TITLE = "Beyond Vision | UK Creator Management Agency for TikTok and Instagram";
const HOME_DESC = "Beyond Vision is a UK creator management agency. We manage TikTok and Instagram creators and run influencer campaigns for brands, from casting and rates to content and results.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: HOME_TITLE, template: "%s | Beyond Vision" },
  description: HOME_DESC,
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo_main.jpg", type: "image/jpeg", sizes: "1080x1080" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo_main.jpg",
  },
  openGraph: {
    type: "website",
    siteName: "Beyond Vision",
    locale: "en_GB",
    url: "/",
    title: HOME_TITLE,
    description: HOME_DESC,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESC,
    images: [OG_IMAGE.url],
  }
};

// Tells Google who we are: name, logo and our social profiles.
const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Beyond Vision",
  legalName: "Beyond Vision Ltd",
  url: SITE_URL,
  logo: `${SITE_URL}/logo_main.jpg`,
  description: HOME_DESC,
  areaServed: ["GB", "US"],
  sameAs: [
    "https://www.instagram.com/beyondvisionltd/",
    "https://www.linkedin.com/company/beyond-vision-ltd/",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakartaSans.variable} suppressHydrationWarning>
      <head>
        <style>{`
          html, body { background: var(--bv-bg-deep) !important; color-scheme: dark; }
        `}</style>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }} />
      </head>
      <body suppressHydrationWarning>
        <SiteTracker />
        {children}
      </body>
    </html>
  );
}
