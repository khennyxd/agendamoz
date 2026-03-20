"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Calendar, List, Users, BarChart3,
  CreditCard, Globe, DollarSign, Menu, ChevronDown,
  AlertCircle, HelpCircle, LogOut, User, CheckCircle,
} from "lucide-react";
import { supabase, type Business } from "@/lib/supabase";

const navSections = [
  {
    key: "principal",
    label: "PRINCIPAL",
    items: [{ href: "/dashboard", label: "Visão Geral", icon: LayoutDashboard }],
  },
  {
    key: "gestao",
    label: "GESTÃO",
    items: [
      { href: "/dashboard/appointments", label: "Agendamentos", icon: Calendar },
      { href: "/dashboard/services",     label: "Serviços",     icon: List },
      { href: "/dashboard/team",         label: "Equipa",       icon: Users },
    ],
  },
  {
    key: "analise",
    label: "ANÁLISE",
    items: [
      { href: "/dashboard/reports",   label: "Relatórios", icon: BarChart3 },
      { href: "/dashboard/finances",  label: "Finanças",   icon: DollarSign, badge: "Beta" },
    ],
  },
  {
    key: "conta",
    label: "CONTA",
    items: [
      { href: "/dashboard/public-page", label: "Página Pública", icon: Globe },
      { href: "/dashboard/billing",     label: "Subscrição",     icon: CreditCard },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [bizLoading, setBizLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: ownedBiz } = await supabase
        .from("businesses").select("*").eq("owner_id", user.id).single();

      if (ownedBiz) { setBusiness(ownedBiz); setBizLoading(false); return; }

      const { data: membership } = await supabase
        .from("team_members").select("business_id")
        .eq("user_id", user.id).eq("status", "active").single();

      if (membership) {
        const { data: memberBiz } = await supabase
          .from("businesses").select("*").eq("id", membership.business_id).single();
        if (memberBiz) { setBusiness(memberBiz); setBizLoading(false); return; }
      }

      setBizLoading(false);
      router.push("/dashboard/onboarding");
    }

    async function loadAvatar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.storage.from("avatars").getPublicUrl(`${user.id}/avatar`);
      if (data?.publicUrl) {
        // Check if file actually exists
        try {
          const res = await fetch(data.publicUrl, { method: "HEAD" });
          if (res.ok) setAvatarUrl(data.publicUrl + "?t=" + Date.now());
        } catch {}
      }
    }

    load();
    loadAvatar();
  }, [router]);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  function toggleSection(key: string) {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const showBanner = business && !business.is_active;

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Logo + Business */}
      <div className="px-4 py-4 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-1.5 mb-3">
          <img src="/amlogo.svg" alt="AgendaMoz" className="h-8 w-auto" />
          <span className="font-display text-lg text-gray-900 ml-0.5">
            <span className="font-bold">Agenda</span><span className="font-normal">Moz</span>
          </span>
        </Link>

        {/* Business info with skeleton loader */}
        {bizLoading ? (
          <div className="space-y-1.5 animate-pulse">
            <div className="h-2.5 bg-gray-200 rounded w-16" />
            <div className="h-3.5 bg-gray-200 rounded w-32" />
          </div>
        ) : business ? (
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Negócio</p>
            <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{business.name}</p>
          </div>
        ) : null}
      </div>

      {/* Inactive warning */}
      {showBanner && (
        <div className="mx-3 mt-3 rounded-xl p-3 text-xs bg-red-50 border border-red-100 text-red-600">
          <p className="font-semibold mb-0.5 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Conta inactiva
          </p>
          <Link href="/dashboard/billing" className="underline font-medium" onClick={() => setSidebarOpen(false)}>
            Subscrever agora →
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {navSections.map((section) => {
          const isCollapsed = collapsed[section.key];
          const hasActive = section.items.some(i => pathname === i.href);
          return (
            <div key={section.key} className="mb-1">
              {/* Section header — clickable */}
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <span className="text-[10px] font-semibold text-gray-400 tracking-widest group-hover:text-gray-600 transition-colors">
                  {section.label}
                </span>
                <ChevronDown className={`w-3 h-3 text-gray-300 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`} />
              </button>

              {/* Items */}
              <div className={`overflow-hidden transition-all duration-200 ${isCollapsed ? "max-h-0" : "max-h-96"}`}>
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
                        }`}>{badge}</span>
                      )}
                      {label === "Subscrição" && !business?.is_active && (
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
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
            A sua conta está inactiva.{" "}
            <Link href="/dashboard/billing" className="underline font-bold">Subscrever agora</Link>
          </div>
        )}

        {/* Top bar with profile */}
        <header className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40">
          {/* Mobile menu */}
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden md:block" />

          {/* Right side — goal widget placeholder + profile */}
          <div className="flex items-center gap-3" ref={profileRef}>
            {/* Profile button */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center hover:bg-purple-200 transition-colors overflow-hidden border-2 border-purple-200"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-purple-600" />
                )}
              </button>

              {/* Profile dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-11 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
                  {/* Business name + status */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 text-sm truncate">{business?.name}</p>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                        <CheckCircle className="w-2.5 h-2.5" />
                        {business?.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      Meu perfil
                    </Link>
                    <Link
                      href="https://wa.me/258878107439?text=Preciso+de+ajuda+com+o+AgendaMoz"
                      target="_blank"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                      Ajuda e suporte
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair da conta
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
