"use client";

import { useEffect, useState } from "react";
import { Save, ExternalLink } from "lucide-react";
import { supabase, type Business } from "@/lib/supabase";

export default function SettingsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "", description: "", slug: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("businesses").select("*").eq("owner_id", user.id).single();
      if (data) {
        setBusiness(data);
        setForm({ name: data.name, phone: data.phone || "", address: data.address || "", description: data.description || "", slug: data.slug });
      }
      setLoading(false);
    }
    load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!business) return;
    setSaving(true);
    await supabase.from("businesses").update(form).eq("id", business.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setSaving(false);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-teal-800 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-3xl font-bold mb-2">Definições</h1>
      <p className="text-gray-500 mb-8">Configure as informações do seu negócio</p>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
          ✓ Alterações guardadas com sucesso!
        </div>
      )}

      <form onSubmit={save} className="flex flex-col gap-6">
        <div className="card">
          <h2 className="font-display text-lg font-bold mb-5">Informações do negócio</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Nome do negócio</label>
              <input className="input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Descrição</label>
              <textarea className="input resize-none" rows={3} placeholder="Descreva o seu negócio para os clientes..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Telefone</label>
                <input className="input" placeholder="+258 84 000 0000" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Endereço</label>
                <input className="input" placeholder="Av. Julius Nyerere, Maputo" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-display text-lg font-bold mb-2">Link da página pública</h2>
          <p className="text-gray-500 text-sm mb-4">Este é o link que os seus clientes usam para fazer reservas</p>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden mb-3">
            <span className="bg-gray-50 px-3 py-3 text-gray-500 text-sm border-r border-gray-200 flex-shrink-0">agendamoz.co.mz/book/</span>
            <input
              className="flex-1 px-3 py-3 text-sm focus:outline-none"
              value={form.slug}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40),
                }))
              }
            />
          </div>
          <a href={`/book/${form.slug}`} target="_blank" className="flex items-center gap-1 text-sm text-teal-700 hover:text-teal-800">
            Abrir página pública <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 self-start">
          <Save className="w-4 h-4" />
          {saving ? "A guardar..." : "Guardar alterações"}
        </button>
      </form>
    </div>
  );
}
