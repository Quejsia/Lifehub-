import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LifeHub",
  description: "A little practice goes a long way.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}