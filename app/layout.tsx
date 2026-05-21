import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Budget Battle",
  description: "AI-powered cyber spending personality battle reports for students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
