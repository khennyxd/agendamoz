"use client";
import { useEffect, useState } from "react";
import { Plus, Search, Calendar, Phone, X } from "lucide-react";
import { supabase, type Appointment, type Service, type Business } from "@/lib/supabase";
import { useBusinessId } from "@/lib/useBusinessId";
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-500 text-sm mt-1">{appointments.length} total</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm py-2.5">
          <Plus className="w-4 h-4" /> Novo
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-10" placeholder="Pesquisar por nome ou telefone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as Status)}>
          <option value="all">Todos os estados</option>
          <option value="pending">Pendente</option>
          <option value="confirmed">Confirmado</option>
          <option value="completed">Concluído</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">Nenhum agendamento encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Cliente</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4 hidden sm:table-cell">Serviço</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Data & Hora</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Estado</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 text-sm">{appt.client_name}</p>
                      <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{appt.client_phone}</p>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <p className="text-gray-800 text-sm">{(appt as any).service?.name || "—"}</p>
                      <p className="text-gray-500 text-xs">{(appt as any).service?.price_mzn} MZN</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-gray-900 text-sm font-medium">{format(parseISO(appt.date), "d MMM yyyy", { locale: pt })}</p>
                      <p className="text-gray-500 text-xs">{appt.time.slice(0, 5)}</p>
                    </td>
                    <td className="px-4 py-4"><StatusBadge status={appt.status} /></td>
                    <td className="px-4 py-4">
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-gray-900">Novo agendamento</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={createAppointment} className="flex flex-col gap-4">
              <div><label className="block text-sm font-semibold mb-2 text-gray-700">Nome do cliente</label><input className="input" placeholder="Maria da Silva" value={newAppt.client_name} onChange={(e) => setNewAppt((p) => ({ ...p, client_name: e.target.value }))} required /></div>
              <div><label className="block text-sm font-semibold mb-2 text-gray-700">Telefone</label><input className="input" placeholder="+258 84 000 0000" value={newAppt.client_phone} onChange={(e) => setNewAppt((p) => ({ ...p, client_phone: e.target.value }))} required /></div>
              <div><label className="block text-sm font-semibold mb-2 text-gray-700">Serviço</label>
                <select className="input" value={newAppt.service_id} onChange={(e) => setNewAppt((p) => ({ ...p, service_id: e.target.value }))} required>
                  <option value="">Seleccionar serviço</option>
                  {services.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.price_mzn} MZN</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-semibold mb-2 text-gray-700">Data</label><input type="date" className="input" value={newAppt.date} onChange={(e) => setNewAppt((p) => ({ ...p, date: e.target.value }))} required /></div>
                <div><label className="block text-sm font-semibold mb-2 text-gray-700">Hora</label><input type="time" className="input" value={newAppt.time} onChange={(e) => setNewAppt((p) => ({ ...p, time: e.target.value }))} required /></div>
              </div>
              <div><label className="block text-sm font-semibold mb-2 text-gray-700">Notas (opcional)</label><textarea className="input resize-none" rows={2} placeholder="Observações..." value={newAppt.notes} onChange={(e) => setNewAppt((p) => ({ ...p, notes: e.target.value }))} /></div>
              <button type="submit" disabled={saving} className="btn-primary w-full justify-center mt-2">{saving ? "A guardar..." : "Criar agendamento"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
