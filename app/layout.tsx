import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit  = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  title: "AgendaMoz — Agendamentos para Clínicas & Salões",
  description: "A plataforma de agendamento mais simples de Moçambique.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${outfit.variable} ${jakarta.variable}`}>
      <body className="font-body bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
