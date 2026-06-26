import type { Metadata } from "next";
import { Rajdhani } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google';
import "./globals.css";

const rajdhani = Rajdhani({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-rajdhani",
});

export const metadata: Metadata = {
  title: "Squad Metalstorm - Tool",
  description: "Herramienta de gestión de escuadrones y calculadoras para Metalstorm.",
  openGraph: {
    title: "Squad Metalstorm - Tool",
    description: "Administra tu escuadrón, aviones y calcula recursos en Metalstorm.",
    url: "https://metalstorm.app",
    siteName: "Squad Metalstorm",
    type: "website",
  },
};

import { Navbar } from "@/components/layout/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${rajdhani.variable} ${rajdhani.className} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col relative" suppressHydrationWarning>
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0b0f19] to-[#0b0f19]"></div>
        <Navbar />
        <main className="flex-1 w-full relative z-0 flex flex-col">
          {children}
        </main>
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
      </body>
    </html>
  );
}
