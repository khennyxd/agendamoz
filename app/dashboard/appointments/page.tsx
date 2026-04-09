"use client";
import { useEffect, useState } from "react";
import { Plus, Search, Calendar, Phone, X, ChevronDown } from "lucide-react";
import { supabase, type Appointment, type Service, type Business } from "@/lib/supabase";
import { useBusinessId } from "@/lib/useBusinessId";
import { sendSMS, smsConfirmacao, smsCancelamento } from "@/lib/sms";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";

type Status = "all" | Appointment["status"];

function StatusBadge({ status }: { status: Appointment["status"] }) {
  const map = { pending: { label: "Pendente", cls: "badge-pending" }, confirmed: { label: "Confirmado", cls: "badge-confirmed" }, completed: { label: "Concluído", cls: "badge-completed" }, cancelled: { label: "Cancelado", cls: "badge-cancelled" } };
  const { label, cls } = map[status];
  return <span className={cls}>{label}</span>;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status>("all");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newAppt, setNewAppt] = useState({ client_name: "", client_phone: "", service_id: "", date: new Date().toISOString().split("T")[0], time: "09:00", notes: "" });

  const { business: resolvedBusiness, loading: bizLoading } = useBusinessId();

  async function load(biz: Business) {
    setBusiness(biz);
    const [{ data: appts }, { data: svcs }] = await Promise.all([
      supabase.from("appointments").select("*, service:services(name, price_mzn, duration_minutes)").eq("business_id", biz.id).order("date", { ascending: false }),
      supabase.from("services").select("*").eq("business_id", biz.id).eq("is_active", true),
    ]);
    setAppointments(appts || []); setServices(svcs || []);
    setLoading(false);
  }

  useEffect(() => { if (!bizLoading && resolvedBusiness) load(resolvedBusiness); }, [resolvedBusiness, bizLoading]);

  async function updateStatus(id: string, status: Appointment["status"]) {
    await supabase.from("appointments").update({ status }).eq("id", id);
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    const appt = appointments.find(a => a.id === id);
    const plan = business?.plan || "none";
    const hasSMS = plan === "profissional" || plan === "empresarial";
    if (appt && business && hasSMS) {
      const dateFormatted = new Date(appt.date).toLocaleDateString("pt-MZ", { day: "2-digit", month: "long" });
      if (status === "confirmed") {
        const serviceName = (appt as any).service?.name || "Serviço";
        sendSMS(appt.client_phone, smsConfirmacao(appt.client_name, business.name, dateFormatted, appt.time.slice(0,5), serviceName)).catch(() => {});
      } else if (status === "cancelled") {
        sendSMS(appt.client_phone, smsCancelamento(appt.client_name, business.name, dateFormatted, appt.time.slice(0,5))).catch(() => {});
      }
    }
  }

  async function createAppointment(e: React.FormEvent) {
    e.preventDefault(); if (!business) return; setSaving(true);
    const { error } = await supabase.from("appointments").insert({ ...newAppt, business_id: business.id, status: "confirmed" });
    if (!error) { setShowModal(false); setNewAppt({ client_name: "", client_phone: "", service_id: "", date: new Date().toISOString().split("T")[0], time: "09:00", notes: "" }); if (business) load(business); }
    setSaving(false);
  }

  const filtered = appointments.filter((a) => {
    const matchSearch = a.client_name.toLowerCase().includes(search.toLowerCase()) || a.client_phone.includes(search);
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{appointments.length} total</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm py-2.5">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Novo</span><span className="sm:hidden">+</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-10" placeholder="Pesquisar nome ou telefone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input sm:w-44" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as Status)}>
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
            <p className="text-gray-500">Nenhum agendamento encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Cliente</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Serviço</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Data & Hora</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Estado</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900 text-sm">{appt.client_name}</p>
                      <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{appt.client_phone}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-gray-800 text-sm">{(appt as any).service?.name || "—"}</p>
                      <p className="text-gray-400 text-xs">{(appt as any).service?.price_mzn} MZN</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-gray-900 text-sm font-medium">{format(parseISO(appt.date), "d MMM yyyy", { locale: pt })}</p>
                      <p className="text-gray-400 text-xs">{appt.time.slice(0, 5)}</p>
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={appt.status} /></td>
                    <td className="px-4 py-3.5">
                      <select className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500" value={appt.status} onChange={(e) => updateStatus(appt.id, e.target.value as Appointment["status"])}>
                        <option value="pending">Pendente</option>
                        <option value="confirmed">Confirmar</option>
                        <option value="completed">Concluir</option>
                        <option value="cancelled">Cancelar</option>
                      </select>
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
            <p className="text-gray-500 text-sm">Nenhum agendamento encontrado</p>
          </div>
        ) : filtered.map((appt) => (
          <div key={appt.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Card header — always visible */}
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-left"
              onClick={() => setExpandedId(expandedId === appt.id ? null : appt.id)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{appt.client_name}</p>
                  <p className="text-gray-400 text-xs">{format(parseISO(appt.date), "d MMM", { locale: pt })} · {appt.time.slice(0,5)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <StatusBadge status={appt.status} />
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === appt.id ? "rotate-180" : ""}`} />
              </div>
            </button>

            {/* Expanded details */}
            {expandedId === appt.id && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-3 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Telefone</p>
                    <p className="text-gray-800 font-medium">{appt.client_phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Serviço</p>
                    <p className="text-gray-800 font-medium">{(appt as any).service?.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Preço</p>
                    <p className="text-gray-800 font-medium">{(appt as any).service?.price_mzn || 0} MZN</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Data completa</p>
                    <p className="text-gray-800 font-medium">{format(parseISO(appt.date), "d MMM yyyy", { locale: pt })}</p>
                  </div>
                </div>
                {appt.notes && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Notas</p>
                    <p className="text-gray-600 text-sm">{appt.notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">Alterar estado</p>
                  <select
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={appt.status}
                    onChange={(e) => updateStatus(appt.id, e.target.value as Appointment["status"])}
                  >
                    <option value="pending">Pendente</option>
                    <option value="confirmed">Confirmar</option>
                    <option value="completed">Concluir</option>
                    <option value="cancelled">Cancelar</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New appointment modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-gray-900">Novo agendamento</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={createAppointment} className="flex flex-col gap-4">
              <div><label className="block text-sm font-semibold mb-1.5 text-gray-700">Nome do cliente</label><input className="input" placeholder="Maria da Silva" value={newAppt.client_name} onChange={(e) => setNewAppt((p) => ({ ...p, client_name: e.target.value }))} required /></div>
              <div><label className="block text-sm font-semibold mb-1.5 text-gray-700">Telefone</label><input className="input" placeholder="+258 84 000 0000" value={newAppt.client_phone} onChange={(e) => setNewAppt((p) => ({ ...p, client_phone: e.target.value }))} required /></div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Serviço</label>
                <select className="input" value={newAppt.service_id} onChange={(e) => setNewAppt((p) => ({ ...p, service_id: e.target.value }))} required>
                  <option value="">Seleccionar serviço</option>
                  {services.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.price_mzn} MZN</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-semibold mb-1.5 text-gray-700">Data</label><input type="date" className="input" value={newAppt.date} onChange={(e) => setNewAppt((p) => ({ ...p, date: e.target.value }))} required /></div>
                <div><label className="block text-sm font-semibold mb-1.5 text-gray-700">Hora</label><input type="time" className="input" value={newAppt.time} onChange={(e) => setNewAppt((p) => ({ ...p, time: e.target.value }))} required /></div>
              </div>
              <div><label className="block text-sm font-semibold mb-1.5 text-gray-700">Notas (opcional)</label><textarea className="input resize-none" rows={2} value={newAppt.notes} onChange={(e) => setNewAppt((p) => ({ ...p, notes: e.target.value }))} /></div>
              <button type="submit" disabled={saving} className="btn-primary w-full justify-center mt-1">{saving ? "A guardar..." : "Criar agendamento"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
