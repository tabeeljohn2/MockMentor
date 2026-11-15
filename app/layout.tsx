import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MockMentor",
  description: "AI mock interview platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}