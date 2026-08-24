import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-budget-battle.vercel.app"),
  title: {
    default: "AI Budget Battle",
    template: "%s | AI Budget Battle",
  },
  description: "上传几张账单，生成一份好笑、清晰、能分享的 AI 消费人格战报。",
  openGraph: {
    title: "AI Budget Battle",
    description: "你的消费人格，正在加载。",
    type: "website",
    locale: "zh_CN",
    images: [
      {
        url: "/editorial/budget-battle-hero.jpg",
        width: 1440,
        height: 1800,
        alt: "AI Budget Battle 消费人格视觉",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Budget Battle",
    description: "上传几张账单，生成一份能分享的消费人格战报。",
    images: ["/editorial/budget-battle-hero.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full" data-scroll-behavior="smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased`}>
        {children}
      </body>
    </html>
  );
}
