"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Calendar, List, Users, BarChart3,
  CreditCard, Settings, Globe, DollarSign, LogOut, Menu, X,
} from "lucide-react";
import { supabase, type Business } from "@/lib/supabase";

const navSections = [
  {
    label: "PRINCIPAL",
    items: [
      { href: "/dashboard",              label: "Visão Geral",   icon: LayoutDashboard },
    ],
  },
  {
    label: "GESTÃO",
    items: [
      { href: "/dashboard/appointments", label: "Agendamentos",  icon: Calendar },
      { href: "/dashboard/services",     label: "Serviços",      icon: List },
      { href: "/dashboard/team",         label: "Equipa",        icon: Users },
    ],
  },
  {
    label: "ANÁLISE",
    items: [
      { href: "/dashboard/reports",      label: "Relatórios",    icon: BarChart3 },
      { href: "/dashboard/finances",     label: "Finanças",      icon: DollarSign, badge: "Beta" },
    ],
  },
  {
    label: "CONTA",
    items: [
      { href: "/dashboard/public-page",  label: "Página Pública", icon: Globe },
      { href: "/dashboard/billing",      label: "Subscrição",    icon: CreditCard },
      { href: "/dashboard/settings",     label: "Definições",    icon: Settings },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: ownedBiz } = await supabase
        .from("businesses").select("*").eq("owner_id", user.id).single();

      if (ownedBiz) {
        setBusiness(ownedBiz);
        setIsOwner(true);
        return;
      }

      const { data: membership } = await supabase
        .from("team_members").select("business_id")
        .eq("user_id", user.id).eq("status", "active").single();

      if (membership) {
        const { data: memberBiz } = await supabase
          .from("businesses").select("*").eq("id", membership.business_id).single();
        if (memberBiz) { setBusiness(memberBiz); setIsOwner(false); return; }
      }

      router.push("/dashboard/onboarding");
    }
    load();
  }, [router]);

  const showBanner = business && !business.is_active;

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-200 bg-white">
        <Link href="/" className="flex items-center gap-1.5">
          <img src="/amlogo.svg" alt="AgendaMoz" className="h-8 w-auto" />
          <span className="font-display text-lg text-white ml-0.5">
            <span className="font-bold text-gray-900">Agenda</span><span className="font-normal text-gray-500">Moz</span>
          </span>
        </Link>
        {business && (
          <div className="mt-2 px-1">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Negócio</p>
            <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{business.name}</p>
          </div>
        )}
      </div>

      {/* Inactive warning */}
      {showBanner && (
        <div className="mx-3 mt-3 rounded-xl p-3 text-xs bg-red-50 border border-red-100 text-red-600">
          <p className="font-semibold mb-0.5">⚠️ Conta inactiva</p>
          <Link href="/dashboard/billing" className="underline font-medium" onClick={() => setSidebarOpen(false)}>
            Subscrever agora →
          </Link>
        </div>
      )}

      {/* Nav sections */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="text-[10px] font-semibold text-gray-400 tracking-widest px-3 mb-1.5">
              {section.label}
            </p>
            {section.items.map(({ href, label, icon: Icon, badge }: any) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-all duration-150 ${
                    active
                      ? "bg-purple-600 text-white"
                      : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      active ? "bg-white/20 text-white" : "bg-purple-100 text-purple-600"
                    }`}>
                      {badge}
                    </span>
                  )}
                  {label === "Subscrição" && !business?.is_active && (
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-white">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-56 flex-shrink-0 flex-col h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-56 bg-white shadow-xl">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Inactive banner */}
        {showBanner && (
          <div className="px-4 py-2.5 text-sm text-center font-medium flex items-center justify-center gap-2 bg-red-500 text-white">
            A sua conta está inactiva. Os clientes não conseguem fazer reservas.{" "}
            <Link href="/dashboard/billing" className="underline font-bold">Subscrever agora</Link>
          </div>
        )}

        {/* Mobile topbar */}
        <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1">
            <img src="/amlogo.svg" alt="AgendaMoz" className="h-7 w-auto" />
            <span className="font-display text-base text-gray-900">
              <span className="font-bold text-gray-900">Agenda</span><span className="font-normal text-gray-500">Moz</span>
            </span>
          </div>
          <div className="w-9" />
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
