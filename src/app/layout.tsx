import "./globals.css";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import ClientBody from "./ClientBody";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Food Waste Dashboard",
  description: "A comprehensive dashboard for analyzing global food waste data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={fontSans.variable}>
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
