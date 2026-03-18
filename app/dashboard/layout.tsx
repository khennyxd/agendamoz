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
  { href: "/dashboard",              label: "Painel",       icon: LayoutDashboard },
  { href: "/dashboard/appointments", label: "Agendamentos", icon: Calendar },
  { href: "/dashboard/services",     label: "Serviços",     icon: List },
  { href: "/dashboard/billing",      label: "Subscrição",   icon: CreditCard },
  { href: "/dashboard/settings",     label: "Definições",   icon: Settings },
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
    <aside className="flex flex-col h-full bg-obsidian-900 border-r border-[rgba(0,229,255,0.08)]">
      {/* Logo */}
      <div className="p-6 border-b border-[rgba(0,229,255,0.08)]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-cyan-sm">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-lg font-black text-white">AgendaMoz</span>
        </Link>
      </div>

      {/* Business info */}
      {business && (
        <div className="px-4 py-4 border-b border-[rgba(0,229,255,0.08)]">
          <p className="text-xs text-slate-600 mb-1 uppercase tracking-wider">O seu negócio</p>
          <p className="font-semibold text-white text-sm truncate">{business.name}</p>
          <a href={`/book/${business.slug}`} target="_blank" className="flex items-center gap-1 text-xs text-cyan-400/60 hover:text-cyan-400 mt-1 transition-colors">
            Ver página pública <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Inactive warning */}
      {showBanner && (
        <div className="mx-3 mt-3 rounded-xl p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400">
          <p className="font-semibold mb-1">⚠️ Conta inactiva</p>
          <Link href="/dashboard/billing" className="underline font-medium text-red-300 hover:text-red-200" onClick={() => setSidebarOpen(false)}>
            Subscrever agora →
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={active ? "nav-item-active" : "nav-item"}
            >
              <Icon className="w-4 h-4" />
              {label}
              {label === "Subscrição" && !business?.is_active && (
                <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[rgba(0,229,255,0.08)]">
        <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-slate-600 hover:text-red-400 transition-colors w-full px-3 py-2 rounded-xl hover:bg-red-500/5">
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-obsidian-950">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 flex-shrink-0 flex-col h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Inactive banner */}
        {showBanner && (
          <div className="px-4 py-2.5 text-sm text-center font-medium flex items-center justify-center gap-2 bg-red-600/90 text-white backdrop-blur-sm">
            <AlertCircle className="w-4 h-4" />
            A sua conta está inactiva. Os clientes não conseguem fazer reservas.{" "}
            <Link href="/dashboard/billing" className="underline font-bold hover:text-red-200">
              Subscrever agora
            </Link>
          </div>
        )}

        {/* Mobile topbar */}
        <header className="md:hidden bg-obsidian-900 border-b border-[rgba(0,229,255,0.08)] px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display font-black text-white">AgendaMoz</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
