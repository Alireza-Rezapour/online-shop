import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainLayout from "./MainLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // metadataBase: new URL("https://yourdomain.com"),
  title: {
    default: "فروشگاه رز",
    template: "فروشگاه رز | %s", // child pages just set title: "..." and it becomes "... | فروشگاه شما"
  },
  description: "توضیحات کلی سایت برای موتورهای جستجو",
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "فروشگاه رز",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body dir="rtl" className="min-h-full flex flex-col">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
