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
      ws["!cols"] = [
        { wch: 12 }, { wch: 8 }, { wch: 20 }, { wch: 16 },
        { wch: 20 }, { wch: 12 }, { wch: 14 }, { wch: 12 },
        { wch: 25 }, { wch: 16 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, "Agendamentos");

      // Use base64 method for mobile compatibility (avoids Blob/createObjectURL issues on iOS/Android)
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "base64" });
      const fileName = `relatorio-${business?.name || "agendamoz"}-${format(new Date(), "yyyy-MM")}.xlsx`;

      // Detect mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // On mobile: use data URI which opens in compatible apps
        const dataUri = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
        const link = document.createElement("a");
        link.setAttribute("href", dataUri);
        link.setAttribute("download", fileName);
        link.setAttribute("target", "_blank");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Desktop: use Blob
        const binary = atob(wbout);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
    } catch (err) {
      console.error("Erro ao exportar:", err);
      alert("Erro ao gerar relatório. Tente novamente.");
    }
    setExporting(false);
  }

  function statusLabel(status: string) {
    const map: Record<string, string> = {
      pending: "Pendente", confirmed: "Confirmado",
      completed: "Concluído", cancelled: "Cancelado",
    };
    return map[status] || status;
  }

  function statusClass(status: string) {
    const map: Record<string, string> = {
      pending: "badge-pending", confirmed: "badge-confirmed",
      completed: "badge-completed", cancelled: "badge-cancelled",
    };
    return map[status] || "badge-pending";
  }

  const totalRevenue = filtered
    .filter(a => a.status === "completed")
    .reduce((s, a) => s + ((a as any).service?.price_mzn || 0), 0);

  const completedCount = filtered.filter(a => a.status === "completed").length;
  const cancelledCount = filtered.filter(a => a.status === "cancelled").length;
  const uniqueClients  = new Set(filtered.map(a => a.client_phone)).size;

  if (bizLoading || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!hasAccess) return (
    <div className="max-w-lg mx-auto text-center py-16 px-4">
      <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Lock className="w-10 h-10 text-purple-400" />
      </div>
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-3">Relatórios</h2>
      <p className="text-gray-500 mb-6">
        Os relatórios e exportação Excel estão disponíveis a partir do plano <strong className="text-gray-800">Profissional</strong>.
      </p>
      <Link href="/dashboard/billing" className="btn-primary inline-flex">
        Ver planos →
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filtered.length} agendamentos no período</p>
        </div>
        <button
          onClick={exportExcel}
          disabled={exporting || filtered.length === 0}
          className="btn-primary flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          {exporting ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />A preparar...</>
          ) : (
            <><Download className="w-4 h-4" />Exportar Excel</>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <select
          value={period}
          onChange={e => setPeriod(e.target.value as FilterPeriod)}
          className="input sm:max-w-[200px] text-sm"
        >
          <option value="this_month">Este mês</option>
          <option value="last_month">Mês passado</option>
          <option value="last_3_months">Últimos 3 meses</option>
          <option value="all">Todo o período</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="input sm:max-w-[200px] text-sm"
        >
          <option value="all">Todos os estados</option>
          <option value="pending">Pendente</option>
          <option value="confirmed">Confirmado</option>
          <option value="completed">Concluído</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          { label: "Total", value: filtered.length, icon: <Calendar className="w-5 h-5 text-purple-500" />, bg: "bg-purple-50" },
          { label: "Concluídos", value: completedCount, icon: <CheckCircle className="w-5 h-5 text-green-500" />, bg: "bg-green-50" },
          { label: "Cancelados", value: cancelledCount, icon: <X className="w-5 h-5 text-red-500" />, bg: "bg-red-50" },
          { label: "Clientes", value: uniqueClients, icon: <Users className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <p className="font-nums text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue highlight */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-5 sm:p-6 mb-8 text-white">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-purple-200 flex-shrink-0" />
          <div>
            <p className="text-purple-200 text-sm font-medium">Receita do período (concluídos)</p>
            <p className="font-nums text-3xl font-bold mt-0.5">{totalRevenue.toLocaleString("pt-MZ")} <span className="text-xl font-normal text-purple-200">MZN</span></p>
          </div>
        </div>
      </div>

      {/* Table — desktop */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum agendamento encontrado para este período.</p>
        </div>
      ) : (
        <>
          <div className="hidden sm:block bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Cliente", "Serviço", "Data & Hora", "Estado", "Valor"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 first:pl-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 text-sm">{a.client_name}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{a.client_phone}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-700 text-sm">{(a as any).service?.name || "—"}</td>
                    <td className="px-5 py-4">
                      <p className="text-gray-900 text-sm font-medium">{format(parseISO(a.date), "d MMM yyyy", { locale: pt })}</p>
                      <p className="text-gray-400 text-xs">{a.time.slice(0, 5)}</p>
                    </td>
                    <td className="px-5 py-4"><span className={statusClass(a.status)}>{statusLabel(a.status)}</span></td>
                    <td className="px-5 py-4 text-gray-800 text-sm font-semibold">
                      {((a as any).service?.price_mzn || 0).toLocaleString()} MZN
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: accordion cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {filtered.map(a => (
              <div key={a.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                  onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                >
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{a.client_name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {format(parseISO(a.date), "d MMM", { locale: pt })} · {a.time.slice(0,5)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={statusClass(a.status)}>{statusLabel(a.status)}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === a.id ? "rotate-180" : ""}`} />
                  </div>
                </button>
                {expandedId === a.id && (
                  <div className="border-t border-gray-100 px-4 py-3 grid grid-cols-2 gap-3 bg-gray-50">
                    {[
                      { label: "Telefone", value: a.client_phone },
                      { label: "Serviço", value: (a as any).service?.name || "—" },
                      { label: "Preço", value: `${(a as any).service?.price_mzn || 0} MZN` },
                      { label: "Data", value: format(parseISO(a.date), "d MMM yyyy", { locale: pt }) },
                    ].map(f => (
                      <div key={f.label}>
                        <p className="text-xs text-gray-400 mb-0.5">{f.label}</p>
                        <p className="text-gray-800 font-medium text-sm">{f.value}</p>
                      </div>
                    ))}
                    {a.notes && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-400 mb-0.5">Notas</p>
                        <p className="text-gray-700 text-sm">{a.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
