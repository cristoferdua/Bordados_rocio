import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bordados Rocio - Alquiler de Vestimentas Elegantes",
  description:
    "Alquiler de vestidos de novia, trajes para dama de honor, vestidos de noche y trajes formales para caballeros. Elegancia y calidad para tus eventos especiales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${inter.variable} h-full`}
    >
      <body className="h-full font-sans antialiased">
        <PublicHeader />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <PublicFooter />
      </body>
    </html>
  );
}
