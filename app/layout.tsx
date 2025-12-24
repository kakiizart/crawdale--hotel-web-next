import type { Metadata } from "next";
import "./globals.css";
import { Archivo_Black, Space_Grotesk } from "next/font/google";

export const metadata: Metadata = {
  title: "Crawdale Hotel",
  description: "Crawdale Hotel App",
};

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display", // ✅ source var (NOT tailwind token)
  display: "swap",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-body", // ✅ source var (NOT tailwind token)
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${archivoBlack.variable} ${space.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
