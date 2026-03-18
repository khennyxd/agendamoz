import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AgendaMoz — Agendamentos para Clínicas & Salões",
  description:
    "A plataforma de agendamento mais simples de Moçambique. Gerencie consultas, serviços e clientes num só lugar.",
  keywords: ["agendamento", "clínica", "salão", "Moçambique", "Maputo"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="font-body bg-obsidian-950 text-slate-200 antialiased">
        {children}
      </body>
    </html>
  );
}
