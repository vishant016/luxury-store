import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Desire — Timeless Elegance",
  description:
    "A high-end luxury e-commerce platform featuring curated collections of refined menswear.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${playfair.variable} antialiased`}
    >
      <body className="relative z-[1] min-h-screen flex flex-col bg-transparent text-charcoal font-sans selection:bg-charcoal selection:text-cream">
        <Header />
        <div className="relative z-[1] flex-1 pt-16">{children}</div>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
