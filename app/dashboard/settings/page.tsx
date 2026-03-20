"use client";

import { useEffect, useState } from "react";
import { Save, ExternalLink, LogOut, Globe } from "lucide-react";
import { supabase, type Business } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "", description: "", slug: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lang, setLang] = useState("pt");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("businesses").select("*").eq("owner_id", user.id).single();
      if (data) { setBusiness(data); setForm({ name: data.name, phone: data.phone || "", address: data.address || "", description: data.description || "", slug: data.slug }); }
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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-7 h-7 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Definições</h1>
      <p className="text-gray-500 mb-8 text-sm">Configure as informações do seu negócio</p>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
          ✓ Alterações guardadas com sucesso!
        </div>
      )}

      <form onSubmit={save} className="flex flex-col gap-5 mb-6">
        {/* Business info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-display text-base font-bold text-gray-900 mb-4">Informações do negócio</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Nome do negócio</label>
              <input className="input" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Descrição</label>
              <textarea className="input resize-none" rows={3} value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Telefone</label>
                <input className="input" placeholder="+258 84 000 0000" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Endereço</label>
                <input className="input" value={form.address} onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))} />
              </div>
            </div>
          </div>
        </div>

        {/* Public link */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-display text-base font-bold text-gray-900 mb-2">Link da página pública</h2>
          <p className="text-gray-500 text-sm mb-4">Link que os seus clientes usam para fazer reservas</p>
          <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden mb-3">
            <span className="bg-gray-50 px-3 py-3 text-gray-500 text-sm border-r border-gray-300 flex-shrink-0">agendamoz.vercel.app/book/</span>
            <input className="flex-1 px-3 py-3 text-sm focus:outline-none text-gray-900" value={form.slug}
              onChange={(e) => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40) }))} />
          </div>
          <a href={`/book/${form.slug}`} target="_blank" className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 transition-colors">
            Abrir página pública <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 self-start">
          <Save className="w-4 h-4" />{saving ? "A guardar..." : "Guardar alterações"}
        </button>
      </form>

      {/* Language */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-5">
        <h2 className="font-display text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-400" /> Idioma
        </h2>
        <div className="flex gap-3">
          {[
            { code: "pt", label: "🇵🇹 Português" },
            { code: "en", label: "🇬🇧 English" },
          ].map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                lang === code
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-200 text-gray-600 hover:border-purple-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {lang === "en" && (
          <p className="text-xs text-amber-600 mt-3">⚠️ English translation coming soon. The interface will remain in Portuguese for now.</p>
        )}
      </div>

      {/* Logout */}
      <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
        <h2 className="font-display text-base font-bold text-gray-900 mb-1">Sair da conta</h2>
        <p className="text-gray-500 text-sm mb-4">Terminar a sessão actual neste dispositivo</p>
        {showLogoutConfirm ? (
          <div className="flex gap-3">
            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
              Confirmar saída
            </button>
            <button onClick={() => setShowLogoutConfirm(false)} className="border border-gray-300 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-4 py-2.5 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" /> Sair da conta
          </button>
        )}
      </div>
    </div>
  );
}
