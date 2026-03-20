"use client";

import { useEffect, useState, useRef } from "react";
import { Save, ExternalLink, Globe, Camera, User } from "lucide-react";
import { supabase, type Business } from "@/lib/supabase";

export default function SettingsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "", description: "", slug: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lang, setLang] = useState("pt");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("businesses").select("*").eq("owner_id", user.id).single();
      if (data) { setBusiness(data); setForm({ name: data.name, phone: data.phone || "", address: data.address || "", description: data.description || "", slug: data.slug }); }

      // Load avatar
      const { data: urlData } = await supabase.storage.from("avatars").getPublicUrl(`${user.id}/avatar`);
      if (urlData?.publicUrl) {
        try {
          const res = await fetch(urlData.publicUrl, { method: "HEAD" });
          if (res.ok) setAvatarUrl(urlData.publicUrl + "?t=" + Date.now());
        } catch {}
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg','image/png','image/gif','image/webp'].includes(file.type)) {
      alert('Formato não suportado. Use JPG, PNG, GIF ou WebP.');
      return;
    }
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ficheiro demasiado grande. Máximo 2MB.');
      return;
    }
    setUploadingAvatar(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(`${user.id}/avatar`, file, { upsert: true, contentType: file.type });

    if (!error) {
      const { data } = await supabase.storage.from("avatars").getPublicUrl(`${user.id}/avatar`);
      setAvatarUrl(data.publicUrl + "?t=" + Date.now());
    }
    setUploadingAvatar(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!business) return;
    setSaving(true);
    await supabase.from("businesses").update(form).eq("id", business.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setSaving(false);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-7 h-7 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Definições</h1>
      <p className="text-gray-500 mb-8 text-sm">Configure o seu perfil e informações do negócio</p>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
          ✓ Alterações guardadas com sucesso!
        </div>
      )}

      {/* Avatar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-5">
        <h2 className="font-display text-base font-bold text-gray-900 mb-4">Foto de perfil</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden border-2 border-purple-200">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-9 h-9 text-purple-400" />
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition-colors shadow-md"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">Foto do negócio</p>
            <p className="text-gray-400 text-xs mt-0.5">JPG, PNG ou GIF — máx. 2MB</p>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar}
              className="mt-2 text-xs font-semibold text-purple-600 hover:text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              {uploadingAvatar ? "A carregar..." : "Alterar foto"}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={save} className="flex flex-col gap-5 mb-5">
        {/* Business info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-display text-base font-bold text-gray-900 mb-4">Informações do negócio</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Nome do negócio</label>
              <input className="input" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Descrição</label>
              <textarea className="input resize-none" rows={3} value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Telefone</label>
                <input className="input" placeholder="+258 84 000 0000" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Endereço</label>
                <input className="input" value={form.address} onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))} />
              </div>
            </div>
          </div>
        </div>

        {/* Public link */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-display text-base font-bold text-gray-900 mb-2">Link da página pública</h2>
          <p className="text-gray-500 text-sm mb-4">Link que os seus clientes usam para fazer reservas</p>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden mb-3">
            <span className="bg-gray-50 px-3 py-3 text-gray-400 text-sm border-r border-gray-200 flex-shrink-0">agendamoz.vercel.app/book/</span>
            <input className="flex-1 px-3 py-3 text-sm focus:outline-none text-gray-900 bg-white" value={form.slug}
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-display text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-400" /> Idioma
        </h2>
        <div className="flex gap-3">
          {[{ code: "pt", label: "🇵🇹 Português" }, { code: "en", label: "🇬🇧 English" }].map(({ code, label }) => (
            <button key={code} onClick={() => setLang(code)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${lang === code ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-600 hover:border-purple-200"}`}>
              {label}
            </button>
          ))}
        </div>
        {lang === "en" && <p className="text-xs text-amber-600 mt-3">⚠️ English translation coming soon.</p>}
      </div>
    </div>
  );
}
