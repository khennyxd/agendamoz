"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, TrendingUp, Users, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { supabase, type Appointment, type Business } from "@/lib/supabase";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { pt } from "date-fns/locale";

function formatDate(dateStr: string) {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Hoje";
  if (isTomorrow(date)) return "Amanhã";
  return format(date, "d MMM", { locale: pt });
}

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
  const [business, setBusiness] = useState<Business | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      setBusiness(biz);

      if (biz) {
        const { data: appts } = await supabase
          .from("appointments")
          .select("*, service:services(name, price_mzn)")
          .eq("business_id", biz.id)
          .order("date", { ascending: true })
          .order("time", { ascending: true });

        setAppointments(appts || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const todayAppts = appointments.filter((a) => a.date === today);
  const pendingAppts = appointments.filter((a) => a.status === "pending");
  const upcoming = appointments.filter((a) => a.date >= today && a.status !== "cancelled").slice(0, 5);

  const thisMonthRevenue = appointments
    .filter((a) => a.status === "completed" && a.date.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((sum, a) => sum + ((a as any).service?.price_mzn || 0), 0);

  const stats = [
    { label: "Agendamentos hoje", value: todayAppts.length, icon: Calendar, color: "teal" },
    { label: "Pendentes",         value: pendingAppts.length, icon: AlertCircle, color: "amber" },
    { label: "Receita do mês",   value: `${thisMonthRevenue.toLocaleString("pt-MZ")} MZN`, icon: TrendingUp, color: "green" },
    { label: "Total de agendamentos", value: appointments.length, icon: Users, color: "gray" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-teal-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Painel</h1>
          <p className="text-gray-500">
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: pt })}
          </p>
        </div>
        <Link href="/dashboard/appointments" className="btn-primary flex items-center gap-2 text-sm py-2.5">
          <Plus className="w-4 h-4" />
          Novo agendamento
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
                <Icon className="w-4 h-4 text-teal-700" />
              </div>
            </div>
            <p className="font-display text-2xl font-bold text-ink">{value}</p>
            <p className="text-gray-500 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold">Próximos agendamentos</h2>
          <Link href="/dashboard/appointments" className="text-sm text-teal-700 hover:text-teal-800 font-medium">
            Ver todos →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">Nenhum agendamento próximo</p>
            <p className="text-sm mt-1">Partilhe o seu link e comece a receber reservas</p>
            {business && (
              <a
                href={`/book/${business.slug}`}
                target="_blank"
                className="inline-block mt-4 text-sm text-teal-700 underline"
              >
                agendamoz.co.mz/book/{business.slug}
              </a>
            )}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {upcoming.map((appt) => (
              <div key={appt.id} className="py-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  <p className="text-teal-800 font-bold text-sm leading-none">{formatDate(appt.date)}</p>
                  <p className="text-teal-600 text-xs mt-0.5">{appt.time.slice(0, 5)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{appt.client_name}</p>
                  <p className="text-gray-500 text-xs">{(appt as any).service?.name || "Serviço"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-600 hidden sm:block">{appt.client_phone}</p>
                  <StatusBadge status={appt.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share link */}
      {business && (
        <div className="mt-6 bg-teal-800 rounded-2xl p-6 text-white">
          <p className="font-display text-lg font-bold mb-1">O seu link de agendamento</p>
          <p className="text-teal-300 text-sm mb-4">Partilhe este link com os seus clientes para receberem reservas online</p>
          <div className="bg-teal-900/50 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-sm truncate">agendamoz.co.mz/book/{business.slug}</p>
            <button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/book/${business.slug}`)}
              className="text-amber-400 text-sm font-semibold hover:text-amber-300 flex-shrink-0"
            >
              Copiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
