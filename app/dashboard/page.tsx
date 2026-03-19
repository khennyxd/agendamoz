"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, TrendingUp, Users, AlertCircle, Plus, ExternalLink } from "lucide-react";
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
      const { data: biz } = await supabase.from("businesses").select("*").eq("owner_id", user.id).single();
      setBusiness(biz);
      if (biz) {
        const { data: appts } = await supabase
          .from("appointments").select("*, service:services(name, price_mzn)")
          .eq("business_id", biz.id).order("date", { ascending: true }).order("time", { ascending: true });
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
    { label: "Agendamentos hoje", value: todayAppts.length, icon: Calendar },
    { label: "Pendentes",         value: pendingAppts.length, icon: AlertCircle },
    { label: "Receita do mês",    value: `${thisMonthRevenue.toLocaleString("pt-MZ")} MZN`, icon: TrendingUp },
    { label: "Total",             value: appointments.length, icon: Users },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-royal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">Painel</h1>
          <p className="text-slate-500">{format(new Date(), "EEEE, d MMMM yyyy", { locale: pt })}</p>
        </div>
        <Link href="/dashboard/appointments" className="btn-primary flex items-center gap-2 text-sm py-2.5">
          <Plus className="w-4 h-4" /> Novo agendamento
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card-glow">
            <div className="w-9 h-9 bg-royal-500/20 rounded-xl flex items-center justify-center mb-3">
              <Icon className="w-4 h-4 text-sky-300" />
            </div>
            <p className="font-display text-2xl font-bold text-white">{value}</p>
            <p className="text-slate-500 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming */}
      <div className="card-glow mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-white">Próximos agendamentos</h2>
          <Link href="/dashboard/appointments" className="text-sm text-sky-300 hover:text-white transition-colors font-medium">
            Ver todos →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="text-center py-12 text-slate-600">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-slate-400">Nenhum agendamento próximo</p>
            <p className="text-sm mt-1">Partilhe o seu link e comece a receber reservas</p>
            {business && (
              <a href={`/book/${business.slug}`} target="_blank" className="inline-flex items-center gap-1 mt-4 text-sm text-sky-300 hover:text-white transition-colors">
                ver página pública <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-royal-500/10">
            {upcoming.map((appt) => (
              <div key={appt.id} className="py-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-royal-500/15 border border-royal-500/20 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  <p className="text-sky-300 font-bold text-sm leading-none">{formatDate(appt.date)}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{appt.time.slice(0, 5)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{appt.client_name}</p>
                  <p className="text-slate-500 text-xs">{(appt as any).service?.name || "Serviço"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-slate-500 hidden sm:block">{appt.client_phone}</p>
                  <StatusBadge status={appt.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share link */}
      {business && (
        <div className="bg-royal-500/10 border border-royal-500/25 rounded-2xl p-6">
          <p className="font-display text-lg font-bold text-white mb-1">O seu link de agendamento</p>
          <p className="text-slate-500 text-sm mb-4">Partilhe este link com os seus clientes para receberem reservas online</p>
          <div className="bg-navy-900 border border-royal-500/20 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-400 truncate">agendamoz.vercel.app/book/{business.slug}</p>
            <button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/book/${business.slug}`)}
              className="text-sky-300 text-sm font-semibold hover:text-white flex-shrink-0 transition-colors"
            >
              Copiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
