"use client";
import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, Clock, DollarSign } from "lucide-react";
import { supabase, type Service, type Business } from "@/lib/supabase";
import { useBusinessId } from "@/lib/useBusinessId";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const emptyForm = { name: "", duration_minutes: 30, price_mzn: 0, description: "" };
  const [form, setForm] = useState(emptyForm);

  const { business: resolvedBusiness, loading: bizLoading } = useBusinessId();

  async function load(biz: Business) {
    setBusiness(biz);
    const { data } = await supabase.from("services").select("*").eq("business_id", biz.id).order("created_at");
    setServices(data || []);
    setLoading(false);
  }

  useEffect(() => { if (!bizLoading && resolvedBusiness) load(resolvedBusiness); }, [resolvedBusiness, bizLoading]);

  function openCreate() { setEditing(null); setForm(emptyForm); setShowModal(true); }
  function openEdit(s: Service) { setEditing(s); setForm({ name: s.name, duration_minutes: s.duration_minutes, price_mzn: s.price_mzn, description: s.description }); setShowModal(true); }

  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!business) return; setSaving(true);
    if (editing) { await supabase.from("services").update(form).eq("id", editing.id); }
    else { await supabase.from("services").insert({ ...form, business_id: business.id }); }
    setShowModal(false); if (business) load(business); setSaving(false);
  }

  async function deleteService(id: string) {
    if (!confirm("Tem certeza que quer apagar este serviço?")) return;
    await supabase.from("services").delete().eq("id", id);
    setServices((prev) => prev.filter((s) => s.id !== id));
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie os serviços que oferece</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm py-2.5"><Plus className="w-4 h-4" /> Novo serviço</button>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm text-center py-16">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><DollarSign className="w-8 h-8 text-purple-600" /></div>
          <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Nenhum serviço ainda</h3>
          <p className="text-gray-500 text-sm mb-6">Adicione os seus serviços para que os clientes possam reservar</p>
          <button onClick={openCreate} className="btn-primary mx-auto">Adicionar primeiro serviço</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:border-purple-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display text-lg font-bold text-gray-900">{service.name}</h3>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <button onClick={() => openEdit(service)} className="p-2 hover:bg-purple-50 rounded-lg text-gray-400 hover:text-purple-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => deleteService(service.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {service.description && <p className="text-gray-600 text-sm mb-4 leading-relaxed">{service.description}</p>}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm text-gray-600"><Clock className="w-4 h-4 text-purple-500" />{service.duration_minutes} min</div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-purple-700"><DollarSign className="w-4 h-4" />{service.price_mzn.toLocaleString("pt-MZ")} MZN</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-gray-900">{editing ? "Editar serviço" : "Novo serviço"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={save} className="flex flex-col gap-4">
              <div><label className="block text-sm font-semibold mb-2 text-gray-700">Nome do serviço</label><input className="input" placeholder="Ex: Consulta geral" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required /></div>
              <div><label className="block text-sm font-semibold mb-2 text-gray-700">Descrição (opcional)</label><textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-semibold mb-2 text-gray-700">Duração (min)</label><input type="number" className="input" min={5} step={5} value={form.duration_minutes} onChange={(e) => setForm((p) => ({ ...p, duration_minutes: Number(e.target.value) }))} required /></div>
                <div><label className="block text-sm font-semibold mb-2 text-gray-700">Preço (MZN)</label><input type="number" className="input" min={0} step={50} value={form.price_mzn} onChange={(e) => setForm((p) => ({ ...p, price_mzn: Number(e.target.value) }))} required /></div>
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full justify-center mt-2">{saving ? "A guardar..." : editing ? "Guardar alterações" : "Criar serviço"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
