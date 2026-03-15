"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar, LayoutDashboard, List, Settings,
  LogOut, Menu, ExternalLink, CreditCard, AlertCircle,
} from "lucide-react";
import { supabase, type Business } from "@/lib/supabase";


const navItems = [
  { href: "/dashboard",              label: "Painel",         icon: LayoutDashboard },
  { href: "/dashboard/appointments", label: "Agendamentos",   icon: Calendar },
  { href: "/dashboard/services",     label: "Serviços",       icon: List },
  { href: "/dashboard/billing",      label: "Subscrição",     icon: CreditCard },
  { href: "/dashboard/settings",     label: "Definições",     icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function loadBusiness() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("businesses").select("*").eq("owner_id", user.id).single();
      if (!data) { router.push("/dashboard/onboarding"); return; }
      setBusiness(data);
    }
    loadBusiness();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const showBanner = business && !business.is_active;

  const Sidebar = () => (
    <aside className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-800 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-lg font-bold text-teal-800">AgendaMoz</span>
        </Link>
      </div>

      {business && (
        <div className="px-4 py-4 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-1">O seu negócio</p>
          <p className="font-semibold text-sm truncate">{business.name}</p>
          <a href={`/book/${business.slug}`} target="_blank" className="flex items-center gap-1 text-xs text-teal-700 hover:text-teal-800 mt-1">
            Ver página pública <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Trial / inactive warning in sidebar */}
      {showBanner && (
        <div className={`mx-3 mt-3 rounded-xl p-3 text-xs ${trialDaysLeft > 0 ? "bg-amber-50 text-amber-800" : "bg-red-50 text-red-700"}`}>
          <p className="font-semibold mb-0.5">⚠️ Conta inactiva</p>
          <Link href="/dashboard/billing" className="underline font-medium" onClick={() => setSidebarOpen(false)}>
            Subscrever agora →
          </Link>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? "bg-teal-800 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {label === "Subscrição" && !business?.is_active && (
                <span className="ml-auto w-2 h-2 bg-amber-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors w-full px-3 py-2">
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-shrink-0 flex-col h-screen sticky top-0">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top banner for inactive accounts */}
        {showBanner && (
          <div className="px-4 py-2.5 text-sm text-center font-medium flex items-center justify-center gap-2 bg-red-600 text-white">
            <AlertCircle className="w-4 h-4" />
            A sua conta está inactiva. Os clientes não conseguem fazer reservas.
            <Link href="/dashboard/billing" className="underline font-bold">
              Subscrever agora
            </Link>
          </div>
        )}

        <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display font-bold text-teal-800">AgendaMoz</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
