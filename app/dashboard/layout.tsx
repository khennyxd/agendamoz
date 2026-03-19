"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Calendar, LayoutDashboard, List, Settings, LogOut, Menu, ExternalLink, CreditCard, AlertCircle, Users } from "lucide-react";
import { supabase, type Business } from "@/lib/supabase";

const navItems = [
  { href: "/dashboard",              label: "Painel",       icon: LayoutDashboard },
  { href: "/dashboard/appointments", label: "Agendamentos", icon: Calendar },
  { href: "/dashboard/services",     label: "Serviços",     icon: List },
  { href: "/dashboard/team",         label: "Equipa",       icon: Users },
  { href: "/dashboard/billing",      label: "Subscrição",   icon: CreditCard },
  { href: "/dashboard/settings",     label: "Definições",   icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Check if owner first
      const { data: ownedBiz } = await supabase
        .from("businesses").select("*").eq("owner_id", user.id).single();

      if (ownedBiz) { setBusiness(ownedBiz); return; }

      // Check if team member
      const { data: membership } = await supabase
        .from("team_members")
        .select("business_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (membership) {
        const { data: memberBiz } = await supabase
          .from("businesses").select("*").eq("id", membership.business_id).single();
        if (memberBiz) { setBusiness(memberBiz); return; }
      }

      // No business found — go to onboarding
      router.push("/dashboard/onboarding");
    }
    load();
  }, [router]);

  async function handleLogout() { await supabase.auth.signOut(); router.push("/"); }

  const showBanner = business && !business.is_active;

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-lg font-bold text-gray-900">AgendaMoz</span>
        </Link>
      </div>

      {business && (
        <div className="px-4 py-4 border-b border-gray-100">
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">O seu negócio</p>
          <p className="font-semibold text-gray-900 text-sm truncate">{business.name}</p>
          <a href={`/book/${business.slug}`} target="_blank" className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 mt-1 transition-colors">
            Ver página pública <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {showBanner && (
        <div className="mx-3 mt-3 rounded-xl p-3 text-xs bg-red-50 border border-red-200 text-red-700">
          <p className="font-semibold mb-1">⚠️ Conta inactiva</p>
          <Link href="/dashboard/billing" className="underline font-medium text-red-600" onClick={() => setSidebarOpen(false)}>Subscrever agora →</Link>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)} className={active ? "nav-item-active" : "nav-item"}>
              <Icon className="w-4 h-4" />
              {label}
              {label === "Subscrição" && !business?.is_active && (
                <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-600 transition-colors w-full px-3 py-2 rounded-xl hover:bg-red-50">
          <LogOut className="w-4 h-4" /> Sair da conta
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="hidden md:flex w-64 flex-shrink-0 flex-col h-screen sticky top-0"><Sidebar /></div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white"><Sidebar /></div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        {showBanner && (
          <div className="px-4 py-2.5 text-sm text-center font-medium flex items-center justify-center gap-2 bg-red-600 text-white">
            <AlertCircle className="w-4 h-4" />
            A sua conta está inactiva. Os clientes não conseguem fazer reservas.{" "}
            <Link href="/dashboard/billing" className="underline font-bold">Subscrever agora</Link>
          </div>
        )}
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display font-bold text-gray-900">AgendaMoz</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
