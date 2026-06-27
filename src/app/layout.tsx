import type { Metadata, Viewport } from "next";
import { Cairo, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

// Premium Arabic type system: Cairo for display headings (strong, editorial),
// IBM Plex Sans Arabic for body/UI (clean, professional). Self-hosted by
// next/font at build time — no runtime network dependency.
const display = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const sans = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "توجيه هاب · Tawjeeh HUB — منصة الأدلة المهنية السعودية",
    template: "%s · توجيه هاب",
  },
  description:
    "منصة توجيه هاب للأدلة المهنية السعودية — ملفات مهنية متخصصة تساعد الطالب والخريج على فهم مسارات التخصص، فرصه، شروطه، شهاداته، وجهات التوظيف داخل سوق العمل السعودي.",
  keywords: [
    "توجيه هاب",
    "الأدلة المهنية",
    "المهن السعودية",
    "التوجيه المهني",
    "سوق العمل السعودي",
  ],
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: "توجيه هاب · Tawjeeh HUB",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#023663",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${display.variable} ${sans.variable}`}
    >
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
