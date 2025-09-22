
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppWrapper from "@/components/AppWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AtalJudge",
    template: "%s | AtalJudge",
  },
  description: "Uma plataforma dedicada ao aprendizado e avaliação de algoritmos.",
  icons: {
    icon: "/hammer.svg",
    shortcut: "/hammer.svg",
    apple: "/hammer.svg",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppWrapper>
          {children}
        </AppWrapper>
      </body>
    </html>
  );
}
