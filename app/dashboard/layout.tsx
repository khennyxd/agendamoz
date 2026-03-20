"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Calendar, LayoutDashboard, List, Settings, LogOut, Menu, ExternalLink, CreditCard, AlertCircle, Users, BarChart3 } from "lucide-react";
import { supabase, type Business } from "@/lib/supabase";

const navItems = [
  { href: "/dashboard",              label: "Painel",       icon: LayoutDashboard },
  { href: "/dashboard/appointments", label: "Agendamentos", icon: Calendar },
  { href: "/dashboard/services",     label: "Serviços",     icon: List },
  { href: "/dashboard/team",         label: "Equipa",       icon: Users },
  { href: "/dashboard/reports",      label: "Relatórios",   icon: BarChart3 },
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
          <img src="/amlogo.svg" alt="AgendaMoz" className="h-8 w-auto" />
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

        {/* WhatsApp support button — profissional+ only */}
        {business?.is_active && (business?.plan === "profissional" || business?.plan === "empresarial") && (
          <a
            href="https://wa.me/258878107439?text=Olá!%20Preciso%20de%20suporte%20com%20o%20AgendaMoz."
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 group"
            title="Suporte via WhatsApp"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="text-sm font-semibold hidden sm:block">Suporte</span>
          </a>
        )}
      </div>
    </div>
  );
}
