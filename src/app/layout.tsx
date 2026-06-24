import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://beyondvision.com'),
  title: "Beyond Vision | Creator Management + Brand Partnerships",
  description: "Creator management and brand partnership support across campaigns, negotiation, social platforms, public appearances, PR, and long-term growth.",
  keywords: ["Influencer Marketing", "Talent Management", "KPI-driven Social", "Beyond Vision", "Performance Marketing", "Social Media Agency"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo_main.jpg", type: "image/jpeg", sizes: "1080x1080" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo_main.jpg",
  },
  openGraph: {
    title: "Beyond Vision | Creator Management + Brand Partnerships",
    description: "Creator management and campaign access for brands built around audience trust.",
    images: [
      {
        url: "/logo_main.jpg",
        width: 1080,
        height: 1080,
        alt: "Beyond Vision logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Beyond Vision | Creator Management + Brand Partnerships",
    description: "Creator management and campaign access for brands built around audience trust.",
    images: ["/logo_main.jpg"],
  }
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
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
