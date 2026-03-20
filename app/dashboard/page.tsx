"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Calendar, TrendingUp, Users, CheckCircle, ChevronRight, Phone, Target, X } from "lucide-react";
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

function fmtMoney(val: number) {
  if (val >= 1000) return `MZN ${(val/1000).toFixed(1)}k`;
  return `MZN ${val.toLocaleString("pt-MZ")}`;
}

// Simple bar chart component
function MiniBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-purple-200 rounded-t-sm transition-all duration-500"
            style={{ height: `${Math.max((d.value / max) * 52, 4)}px`, backgroundColor: i === data.length - 1 ? '#7c3aed' : '#ddd6fe' }}
          />
          <span className="text-[9px] text-gray-400 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { business, loading: bizLoading } = useBusinessId();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<FilterPeriod>("this_month");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [isFiltering, setIsFiltering] = useState(false);

  // Revenue goal
  const [goal, setGoal] = useState<number>(0);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("revenue_goal");
    if (saved) setGoal(Number(saved));
  }, []);

  function saveGoal() {
    const val = Number(goalInput.replace(/[^0-9]/g,""));
    setGoal(val);
    localStorage.setItem("revenue_goal", String(val));
    setShowGoalModal(false);
    setGoalInput("");
  }

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

  function handleFilterChange(fn: () => void) {
    setIsFiltering(true);
    fn();
    setTimeout(() => setIsFiltering(false), 600);
  }

  // Filter appointments
  const filtered = appointments.filter((a) => {
    const now = new Date();
    const thisMonth = format(startOfMonth(now), "yyyy-MM-dd");
    const lastMonthStart = format(startOfMonth(subMonths(now, 1)), "yyyy-MM-dd");
    const lastMonthEnd = format(new Date(now.getFullYear(), now.getMonth(), 0), "yyyy-MM-dd");
    const today = format(now, "yyyy-MM-dd");

    let matchPeriod = true;
    if (period === "today") matchPeriod = a.date === today;
    else if (period === "this_month") matchPeriod = a.date >= thisMonth;
    else if (period === "last_month") matchPeriod = a.date >= lastMonthStart && a.date <= lastMonthEnd;

    const matchService = serviceFilter === "all" || a.service_id === serviceFilter;
    return matchPeriod && matchService;
  });

  const today = format(new Date(), "yyyy-MM-dd");
  const revenue = filtered.filter(a => a.status === "completed").reduce((s, a) => s + ((a as any).service?.price_mzn || 0), 0);
  const totalAppts = filtered.length;
  const completed = filtered.filter(a => a.status === "completed").length;
  const pending = filtered.filter(a => a.status === "pending").length;

  // Chart data — last 6 months
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i);
    const monthKey = format(d, "yyyy-MM");
    const val = appointments
      .filter(a => a.status === "completed" && a.date.startsWith(monthKey))
      .reduce((s, a) => s + ((a as any).service?.price_mzn || 0), 0);
    return { label: format(d, "MMM", { locale: pt }), value: val };
  });

  // Next 3 pending appointments
  const upcoming = appointments
    .filter(a => a.date >= today && a.status === "pending")
    .slice(0, 3);

  // Goal progress
  const goalProgress = goal > 0 ? Math.min((revenue / goal) * 100, 100) : 0;

  if (loading || bizLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`max-w-6xl mx-auto transition-all duration-300 ${isFiltering ? "opacity-40 blur-sm" : "opacity-100 blur-none"}`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Equipa de {business?.name}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{format(new Date(), "EEEE, d MMMM yyyy", { locale: pt })}</p>
        </div>

        {/* Revenue goal widget */}
        <button
          onClick={() => setShowGoalModal(true)}
          className="hidden sm:flex flex-col items-start bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm hover:border-purple-300 hover:shadow-md transition-all duration-200 min-w-[180px]"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Meta de faturamento</span>
            </div>
            {goal > 0 && <span className="text-[10px] text-purple-600 font-bold">{goalProgress.toFixed(0)}%</span>}
          </div>
          <p className="text-sm font-bold text-gray-900 mb-2">
            {fmtMoney(revenue)} {goal > 0 && <span className="text-gray-400 font-normal">/ {fmtMoney(goal)}</span>}
          </p>
          {goal > 0 ? (
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-purple-500 h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
          ) : (
            <p className="text-[11px] text-purple-500 font-medium">+ Definir meta</p>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-2">
          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={period}
            onChange={(e) => handleFilterChange(() => setPeriod(e.target.value as FilterPeriod))}
          >
            <option value="today">Hoje</option>
            <option value="this_month">Este mês</option>
            <option value="last_month">Mês passado</option>
            <option value="all">Todo o período</option>
          </select>
        </div>
        <select
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={serviceFilter}
          onChange={(e) => handleFilterChange(() => setServiceFilter(e.target.value))}
        >
          <option value="all">Todos os serviços</option>
          {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Stats + Chart row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
        {/* Stat cards */}
        {[
          { label: "FATURAMENTO TOTAL",       value: `MZN ${revenue.toLocaleString("pt-MZ")}`, icon: TrendingUp },
          { label: "TOTAL DE AGENDAMENTOS",   value: totalAppts, icon: Calendar },
          { label: "CONCLUÍDOS",              value: completed,  icon: CheckCircle },
          { label: "PENDENTES",               value: pending,    icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-tight">{label}</p>
              <Icon className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
            </div>
            <p className="font-display text-xl font-bold text-gray-900">{value}</p>
          </div>
        ))}

        {/* Mini chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">ÚLTIMOS 6 MESES</p>
          <MiniBarChart data={chartData} />
        </div>
      </div>

      {/* Upcoming appointments */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h2 className="font-display text-sm font-bold text-gray-900">Próximos agendamentos pendentes</h2>
          <Link href="/dashboard/appointments" className="text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1">
            Ver todos <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-7 h-7 mx-auto mb-2 text-gray-200" />
            <p className="text-gray-400 text-sm">Nenhum agendamento pendente</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {upcoming.map((appt) => {
              const apptDate = parseISO(appt.date);
              const dateLabel = isToday(apptDate) ? "Hoje" : isTomorrow(apptDate) ? "Amanhã" : format(apptDate, "d MMM", { locale: pt });
              return (
                <div key={appt.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 bg-purple-50 border border-purple-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <p className="text-purple-700 font-bold text-[11px] leading-none">{dateLabel}</p>
                    <p className="text-purple-400 text-[11px] mt-0.5">{appt.time.slice(0, 5)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{appt.client_name}</p>
                    <p className="text-gray-400 text-xs truncate">{(appt as any).service?.name || "Serviço"}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="text-gray-400 text-xs hidden sm:flex items-center gap-1">
                      <Phone className="w-3 h-3" />{appt.client_phone}
                    </p>
                    <StatusBadge status={appt.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking link */}
      {business && (
        <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-purple-700 mb-0.5">Link de agendamento</p>
            <p className="text-xs text-purple-400 truncate">agendamoz.vercel.app/book/{business.slug}</p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/book/${business.slug}`)}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex-shrink-0 bg-white border border-purple-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Copiar link
          </button>
        </div>
      )}

      {/* Goal modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowGoalModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-gray-900">Meta de faturamento</h2>
              <button onClick={() => setShowGoalModal(false)} className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-gray-500 text-sm mb-4">Define uma meta mensal para acompanhar o teu progresso</p>
            <input
              className="input mb-4"
              placeholder="Ex: 50000"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              type="number"
              min="0"
            />
            {goalInput && (
              <p className="text-xs text-gray-500 mb-4">= MZN {Number(goalInput).toLocaleString("pt-MZ")}</p>
            )}
            <div className="flex gap-3">
              <button onClick={saveGoal} className="btn-primary flex-1 justify-center text-sm py-2.5">Guardar meta</button>
              {goal > 0 && (
                <button onClick={() => { setGoal(0); localStorage.removeItem("revenue_goal"); setShowGoalModal(false); }}
                  className="border border-gray-300 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50">
                  Remover
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
