
import type { Metadata } from "next";

import AppWrapper from "@/components/AppWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AtalJudge",
    template: "%s | AtalJudge",
  },
  description: "Uma plataforma dedicada ao aprendizado e avaliação de algoritmos.",
  icons: {
    icon: [
      { url: "/hammer.svg", type: "image/svg+xml" },
      { url: "/hammer.png", type: "image/png" }
    ],
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
      <body className="antialiased">
        <AppWrapper>
          {children}
        </AppWrapper>
      </body>
    </html>
  );
}
