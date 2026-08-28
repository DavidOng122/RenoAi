import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RenoAI — Home repair, made clear",
  description: "Turn a photo and a few words into a contractor-ready repair brief.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f4f1ea" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
