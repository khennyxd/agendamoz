"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, TrendingUp, Users, CheckCircle, ChevronRight, Phone } from "lucide-react";
import { supabase, type Appointment, type Service } from "@/lib/supabase";
import { useBusinessId } from "@/lib/useBusinessId";
import { format, isToday, isTomorrow, parseISO, startOfMonth, subMonths } from "date-fns";
import { pt } from "date-fns/locale";

type FilterPeriod = "today" | "this_month" | "last_month" | "all";

function StatusBadge({ status }: { status: Appointment["status"] }) {
  const map = {
    pending:   { label: "Pendente",   cls: "badge-pending" },
    confirmed: { label: "Confirmado", cls: "badge-confirmed" },
    completed: { label: "Concluído",  cls: "badge-completed" },
    cancelled: { label: "Cancelado",  cls: "badge-cancelled" },
  };
  const { label, cls } = map[status];
  return <span className={cls}>{label}</span>;
}

export default function DashboardPage() {
  const { business, loading: bizLoading } = useBusinessId();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<FilterPeriod>("this_month");
  const [serviceFilter, setServiceFilter] = useState("all");

  useEffect(() => {
    async function load() {
      if (!business) return;
      const [{ data: appts }, { data: svcs }] = await Promise.all([
        supabase.from("appointments").select("*, service:services(name, price_mzn)")
          .eq("business_id", business.id).order("date").order("time"),
        supabase.from("services").select("*").eq("business_id", business.id).eq("is_active", true),
      ]);
      setAppointments(appts || []);
      setServices(svcs || []);
      setLoading(false);
    }
    if (!bizLoading && business) load();
  }, [business, bizLoading]);

  // Filter appointments
  const filtered = appointments.filter((a) => {
    const now = new Date();
    const thisMonth = format(startOfMonth(now), "yyyy-MM-dd");
    const lastMonth = format(startOfMonth(subMonths(now, 1)), "yyyy-MM-dd");
    const lastMonthEnd = format(new Date(now.getFullYear(), now.getMonth(), 0), "yyyy-MM-dd");
    const today = format(now, "yyyy-MM-dd");

    let matchPeriod = true;
    if (period === "today") matchPeriod = a.date === today;
    else if (period === "this_month") matchPeriod = a.date >= thisMonth;
    else if (period === "last_month") matchPeriod = a.date >= lastMonth && a.date <= lastMonthEnd;

    const matchService = serviceFilter === "all" || a.service_id === serviceFilter;
    return matchPeriod && matchService;
  });

  const today = format(new Date(), "yyyy-MM-dd");
  const revenue = filtered.filter(a => a.status === "completed").reduce((s, a) => s + ((a as any).service?.price_mzn || 0), 0);
  const totalAppts = filtered.length;
  const completed = filtered.filter(a => a.status === "completed").length;
  const pending = filtered.filter(a => a.status === "pending").length;

  // Next 3 pending appointments
  const upcoming = appointments
    .filter(a => a.date >= today && a.status === "pending")
    .slice(0, 3);

  if (loading || bizLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Olá, {business?.name} 👋</h1>
          <p className="text-gray-500 text-sm mt-0.5">{format(new Date(), "EEEE, d MMMM yyyy", { locale: pt })}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={period} onChange={(e) => setPeriod(e.target.value as FilterPeriod)}>
          <option value="today">Hoje</option>
          <option value="this_month">Este mês</option>
          <option value="last_month">Mês passado</option>
          <option value="all">Todo o período</option>
        </select>
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
          <option value="all">Todos os serviços</option>
          {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "FATURAMENTO TOTAL",
            value: `${revenue.toLocaleString("pt-MZ")} MZN`,
            icon: TrendingUp,
            sub: "agendamentos concluídos",
          },
          {
            label: "TOTAL DE AGENDAMENTOS",
            value: totalAppts,
            icon: Calendar,
            sub: "no período seleccionado",
          },
          {
            label: "CONCLUÍDOS",
            value: completed,
            icon: CheckCircle,
            sub: totalAppts > 0 ? `${Math.round((completed/totalAppts)*100)}% do total` : "—",
          },
          {
            label: "PENDENTES",
            value: pending,
            icon: Users,
            sub: "aguardam confirmação",
          },
        ].map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
              <Icon className="w-4 h-4 text-gray-300" />
            </div>
            <p className="font-display text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Upcoming appointments */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-5">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-display text-base font-bold text-gray-900">Próximos agendamentos</h2>
          <Link href="/dashboard/appointments" className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="text-center py-10">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-200" />
            <p className="text-gray-400 text-sm">Nenhum agendamento pendente</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {upcoming.map((appt) => {
              const apptDate = parseISO(appt.date);
              const dateLabel = isToday(apptDate) ? "Hoje" : isTomorrow(apptDate) ? "Amanhã" : format(apptDate, "d MMM", { locale: pt });
              return (
                <div key={appt.id} className="flex items-center gap-4 px-5 py-3.5">
                  {/* Date+time square */}
                  <div className="w-14 h-14 bg-purple-50 border border-purple-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <p className="text-purple-700 font-bold text-xs leading-none">{dateLabel}</p>
                    <p className="text-purple-500 text-xs mt-0.5">{appt.time.slice(0, 5)}</p>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{appt.client_name}</p>
                    <p className="text-gray-400 text-xs truncate">{(appt as any).service?.name || "Serviço"}</p>
                  </div>
                  {/* Contact */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="text-gray-400 text-xs hidden sm:block flex items-center gap-1">
                      <Phone className="w-3 h-3 inline mr-0.5" />{appt.client_phone}
                    </p>
                    <StatusBadge status={appt.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking link - smaller */}
      {business && (
        <div className="bg-purple-50 border border-purple-100 rounded-xl px-5 py-3.5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-purple-700 mb-0.5">Link de agendamento</p>
            <p className="text-xs text-purple-500 truncate">agendamoz.vercel.app/book/{business.slug}</p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/book/${business.slug}`)}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex-shrink-0 bg-white border border-purple-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Copiar
          </button>
        </div>
      )}
    </div>
  );
}
