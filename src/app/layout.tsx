import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GTO プリフロップトレーナー | 無料・登録不要でポーカーのレンジを練習",
  description: "アカウント登録不要・完全無料のGTOプリフロップトレーナー。6-max/100bbのオープンレンジ・コールレンジをクイズ形式で練習できます。日本語対応。",
  manifest: "/manifest.json",
  verification: {
    google: "8IHhYr805pB9ixIfuvidalt8TfwEq41hTvGGKBULgMQ",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GTO Trainer",
  },
  keywords: ["GTO", "ポーカー", "プリフロップ", "練習", "トレーナー", "無料", "レンジ", "6-max"],
  openGraph: {
    title: "GTO プリフロップトレーナー | 無料ポーカー練習ツール",
    description: "アカウント不要・無料でポーカーのGTOプリフロップを練習。6-max対応。",
    type: "website",
    locale: "ja_JP",
    url: "https://gto-trainer-eight.vercel.app",
    siteName: "GTO プリフロップトレーナー",
    images: [
      {
        url: "/ogp.png",
        width: 1200,
        height: 630,
        alt: "GTO プリフロップトレーナー",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GTO プリフロップトレーナー",
    description: "無料・登録不要でポーカーのGTOを練習",
    images: ["/ogp.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#111827",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
