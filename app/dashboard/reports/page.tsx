"use client";

import { useEffect, useState } from "react";
import { Download, Calendar, TrendingUp, Users, CheckCircle, X, Lock, ChevronDown } from "lucide-react";
import { supabase, type Appointment, getPlanLimits } from "@/lib/supabase";
import { useBusinessId } from "@/lib/useBusinessId";
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { pt } from "date-fns/locale";
import Link from "next/link";

type FilterPeriod = "this_month" | "last_month" | "last_3_months" | "all";

export default function ReportsPage() {
  const { business, loading: bizLoading } = useBusinessId();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filtered, setFiltered] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<FilterPeriod>("this_month");
  const [statusFilter, setStatusFilter] = useState("all");
  const [exporting, setExporting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const limits = getPlanLimits(business?.plan || null);
  const hasAccess = limits.reports && business?.is_active;

  useEffect(() => {
    async function load() {
      if (!business) return;
      const { data } = await supabase
        .from("appointments")
        .select("*, service:services(name, price_mzn, duration_minutes)")
        .eq("business_id", business.id)
        .order("date", { ascending: false })
        .order("time", { ascending: false });
      setAppointments(data || []);
      setLoading(false);
    }
    if (!bizLoading && business) load();
  }, [business, bizLoading]);

  useEffect(() => {
    let result = [...appointments];
    const now = new Date();
    if (period === "this_month") {
      const start = format(startOfMonth(now), "yyyy-MM-dd");
      const end = format(endOfMonth(now), "yyyy-MM-dd");
      result = result.filter(a => a.date >= start && a.date <= end);
    } else if (period === "last_month") {
      const last = subMonths(now, 1);
      const start = format(startOfMonth(last), "yyyy-MM-dd");
      const end = format(endOfMonth(last), "yyyy-MM-dd");
      result = result.filter(a => a.date >= start && a.date <= end);
    } else if (period === "last_3_months") {
      const start = format(startOfMonth(subMonths(now, 3)), "yyyy-MM-dd");
      result = result.filter(a => a.date >= start);
    }
    if (statusFilter !== "all") result = result.filter(a => a.status === statusFilter);
    setFiltered(result);
  }, [appointments, period, statusFilter]);

  async function exportExcel() {
    setExporting(true);
    try {
      const XLSX = await import("xlsx");
      const rows = filtered.map(a => ({
        "Data": format(parseISO(a.date), "dd/MM/yyyy"),
        "Hora": a.time.slice(0, 5),
        "Cliente": a.client_name,
        "Telefone": a.client_phone,
        "Serviço": (a as any).service?.name || "—",
        "Preço (MZN)": (a as any).service?.price_mzn || 0,
        "Duração (min)": (a as any).service?.duration_minutes || 0,
        "Estado": statusLabel(a.status),
        "Notas": a.notes || "",
        "Criado em": format(parseISO(a.created_at), "dd/MM/yyyy HH:mm"),
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      ws["!cols"] = [{ wch: 12 }, { wch: 8 }, { wch: 20 }, { wch: 16 }, { wch: 20 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 25 }, { wch: 16 }];
      XLSX.utils.book_append_sheet(wb, ws, "Agendamentos");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-${business?.name}-${format(new Date(), "yyyy-MM")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) { console.error("Erro ao exportar:", err); }
    setExporting(false);
  }

  function statusLabel(status: string) {
    const map: Record<string, string> = { pending: "Pendente", confirmed: "Confirmado", completed: "Concluído", cancelled: "Cancelado" };
    return map[status] || status;
  }
  function statusClass(status: string) {
    const map: Record<string, string> = { pending: "badge-pending", confirmed: "badge-confirmed", completed: "badge-completed", cancelled: "badge-cancelled" };
    return map[status] || "";
  }

  const totalRevenue = filtered.filter(a => a.status === "completed").reduce((sum, a) => sum + ((a as any).service?.price_mzn || 0), 0);
  const completed = filtered.filter(a => a.status === "completed").length;
  const cancelled = filtered.filter(a => a.status === "cancelled").length;
  const pending = filtered.filter(a => a.status === "pending").length;

  if (bizLoading || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!hasAccess) return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Relatórios</h1>
      <p className="text-gray-500 mb-8 text-sm">Análise detalhada dos seus agendamentos</p>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm text-center py-16 px-6">
        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Lock className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="font-display text-xl font-bold text-gray-900 mb-2">Relatórios indisponíveis</h2>
        <p className="text-gray-500 text-sm mb-2">Disponível a partir do plano <strong>Profissional</strong>.</p>
        <p className="text-gray-400 text-xs mb-8">Relatórios detalhados, estatísticas e exportação Excel.</p>
        <Link href="/dashboard/billing" className="btn-primary inline-flex items-center gap-2">Actualizar para Profissional →</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filtered.length} agendamentos no período</p>
        </div>
        <button
          onClick={exportExcel}
          disabled={exporting || filtered.length === 0}
          className="btn-primary flex items-center gap-2 text-sm py-2.5 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">{exporting ? "A exportar..." : "Exportar Excel"}</span>
          <span className="sm:hidden">Excel</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Receita gerada", value: `${totalRevenue.toLocaleString("pt-MZ")} MZN`, icon: TrendingUp, color: "purple" },
          { label: "Concluídos",     value: completed, icon: CheckCircle, color: "green" },
          { label: "Pendentes",      value: pending,   icon: Calendar,    color: "amber" },
          { label: "Cancelados",     value: cancelled, icon: X,           color: "red" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${color === "purple" ? "bg-purple-100" : color === "green" ? "bg-green-100" : color === "amber" ? "bg-amber-100" : "bg-red-100"}`}>
              <Icon className={`w-4 h-4 ${color === "purple" ? "text-purple-600" : color === "green" ? "text-green-600" : color === "amber" ? "text-amber-600" : "text-red-500"}`} />
            </div>
            <p className="font-mono text-xl font-bold text-gray-900 truncate tabular-nums">{value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <select className="input sm:w-auto" value={period} onChange={(e) => setPeriod(e.target.value as FilterPeriod)}>
          <option value="this_month">Este mês</option>
          <option value="last_month">Mês passado</option>
          <option value="last_3_months">Últimos 3 meses</option>
          <option value="all">Todos os períodos</option>
        </select>
        <select className="input sm:w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Todos os estados</option>
          <option value="pending">Pendente</option>
          <option value="confirmed">Confirmado</option>
          <option value="completed">Concluído</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">Nenhum agendamento no período</p>
            <p className="text-gray-400 text-sm mt-1">Tente alterar os filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">Data & Hora</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Cliente</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Serviço</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Preço</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-gray-900 text-sm font-medium">{format(parseISO(appt.date), "d MMM yyyy", { locale: pt })}</p>
                      <p className="text-gray-400 text-xs">{appt.time.slice(0, 5)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-gray-900 text-sm font-medium">{appt.client_name}</p>
                      <p className="text-gray-400 text-xs">{appt.client_phone}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-gray-700 text-sm">{(appt as any).service?.name || "—"}</p>
                      <p className="text-gray-400 text-xs">{(appt as any).service?.duration_minutes} min</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-gray-900 text-sm font-semibold">{(appt as any).service?.price_mzn?.toLocaleString("pt-MZ") || "0"} MZN</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={statusClass(appt.status)}>{statusLabel(appt.status)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 text-center py-12">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 text-sm">Nenhum agendamento no período</p>
          </div>
        ) : filtered.map((appt) => (
          <div key={appt.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-left"
              onClick={() => setExpandedId(expandedId === appt.id ? null : appt.id)}
            >
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{appt.client_name}</p>
                <p className="text-gray-400 text-xs">{format(parseISO(appt.date), "d MMM", { locale: pt })} · {appt.time.slice(0,5)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className={statusClass(appt.status)}>{statusLabel(appt.status)}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === appt.id ? "rotate-180" : ""}`} />
              </div>
            </button>
            {expandedId === appt.id && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-3 grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-gray-400 mb-0.5">Serviço</p><p className="text-gray-800 font-medium">{(appt as any).service?.name || "—"}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Preço</p><p className="text-gray-800 font-medium">{(appt as any).service?.price_mzn || 0} MZN</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Telefone</p><p className="text-gray-800 font-medium">{appt.client_phone}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Duração</p><p className="text-gray-800 font-medium">{(appt as any).service?.duration_minutes || "—"} min</p></div>
                {appt.notes && <div className="col-span-2"><p className="text-xs text-gray-400 mb-0.5">Notas</p><p className="text-gray-600">{appt.notes}</p></div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
