import type { Metadata } from "next";
import { Raleway, Poppins, Inter } from "next/font/google";
import "./globals.css";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  weight: ["400","500","600","700","800","900"],
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400","500","600","700","800","900"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AgendaMoz — Agendamentos para Clínicas & Salões",
  description: "A plataforma de agendamento mais simples de Moçambique.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${raleway.variable} ${poppins.variable} ${inter.variable}`}>
      <body className="font-body bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
