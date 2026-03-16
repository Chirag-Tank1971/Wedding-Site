import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Udhay & Meenal — Wedding Celebration",
  description: "Wedding celebrations of Udhay & Meenal in Amritsar, 2026.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
