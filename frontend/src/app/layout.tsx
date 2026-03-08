import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FPL Manager AI",
  description: "AI-powered FPL Assistant for context-aware strategy and rival analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          <main className="min-h-screen flex flex-col">
            <header className="border-b border-primary/30 bg-secondary px-6 py-4 flex items-center justify-between shadow-md">
              <h1 className="text-xl font-bold tracking-tight text-white">FPL MANAGER AI</h1>
              <nav className="flex gap-4 text-sm font-medium">
                <span className="text-muted-foreground">Kael v0.1.0</span>
              </nav>
            </header>
            <div className="flex-1 p-6">
              {children}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
