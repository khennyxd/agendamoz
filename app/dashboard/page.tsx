"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, TrendingUp, Users, AlertCircle, Plus, ExternalLink } from "lucide-react";
import { supabase, type Appointment, type Business } from "@/lib/supabase";
import { useBusinessId } from "@/lib/useBusinessId";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { pt } from "date-fns/locale";

function formatDate(d: string) {
  const date = parseISO(d);
  if (isToday(date)) return "Hoje";
  if (isTomorrow(date)) return "Amanhã";
  return format(date, "d MMM", { locale: pt });
}

function StatusBadge({ status }: { status: Appointment["status"] }) {
  const map = { pending: { label: "Pendente", cls: "badge-pending" }, confirmed: { label: "Confirmado", cls: "badge-confirmed" }, completed: { label: "Concluído", cls: "badge-completed" }, cancelled: { label: "Cancelado", cls: "badge-cancelled" } };
  const { label, cls } = map[status];
  return <span className={cls}>{label}</span>;
}

export default function DashboardPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const { business: resolvedBusiness, loading: bizLoading } = useBusinessId();

  useEffect(() => {
    async function load() {
      if (!resolvedBusiness) return;
      setBusiness(resolvedBusiness);
      const { data: appts } = await supabase.from("appointments").select("*, service:services(name, price_mzn)").eq("business_id", resolvedBusiness.id).order("date", { ascending: true }).order("time", { ascending: true });
      setAppointments(appts || []);
      setLoading(false);
    }
    if (!bizLoading) load();
  }, [resolvedBusiness, bizLoading]);

  const today = new Date().toISOString().split("T")[0];
  const todayAppts = appointments.filter((a) => a.date === today);
  const pendingAppts = appointments.filter((a) => a.status === "pending");
  const upcoming = appointments.filter((a) => a.date >= today && a.status !== "cancelled").slice(0, 5);
  const thisMonthRevenue = appointments.filter((a) => a.status === "completed" && a.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((sum, a) => sum + ((a as any).service?.price_mzn || 0), 0);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Painel</h1>
          <p className="text-gray-500">{format(new Date(), "EEEE, d MMMM yyyy", { locale: pt })}</p>
        </div>
        <Link href="/dashboard/appointments" className="btn-primary flex items-center gap-2 text-sm py-2.5">
          <Plus className="w-4 h-4" /> Novo agendamento
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Agendamentos hoje", value: todayAppts.length, icon: Calendar },
          { label: "Pendentes",         value: pendingAppts.length, icon: AlertCircle },
          { label: "Receita do mês",    value: `${thisMonthRevenue.toLocaleString("pt-MZ")} MZN`, icon: TrendingUp },
          { label: "Total",             value: appointments.length, icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
              <Icon className="w-4 h-4 text-purple-600" />
            </div>
            <p className="font-display text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-gray-500 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-gray-900">Próximos agendamentos</h2>
          <Link href="/dashboard/appointments" className="text-sm text-purple-600 hover:text-purple-700 font-medium">Ver todos →</Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-600">Nenhum agendamento próximo</p>
            <p className="text-sm mt-1 text-gray-400">Partilhe o seu link e comece a receber reservas</p>
            {business && (
              <a href={`/book/${business.slug}`} target="_blank" className="inline-flex items-center gap-1 mt-4 text-sm text-purple-600 hover:text-purple-700">
                ver página pública <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {upcoming.map((appt) => (
              <div key={appt.id} className="py-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 border border-purple-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  <p className="text-purple-700 font-bold text-sm leading-none">{formatDate(appt.date)}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{appt.time.slice(0, 5)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{appt.client_name}</p>
                  <p className="text-gray-500 text-xs">{(appt as any).service?.name || "Serviço"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-500 hidden sm:block">{appt.client_phone}</p>
                  <StatusBadge status={appt.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {business && (
        <div className="bg-purple-600 rounded-2xl p-6 text-white">
          <p className="font-display text-lg font-bold mb-1">O seu link de agendamento</p>
          <p className="text-purple-200 text-sm mb-4">Partilhe com os seus clientes para receberem reservas online</p>
          <div className="bg-purple-700 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-purple-200 truncate">agendamoz.vercel.app/book/{business.slug}</p>
            <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/book/${business.slug}`)} className="text-white text-sm font-bold hover:text-purple-200 flex-shrink-0 transition-colors">
              Copiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
