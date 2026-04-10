"use client";

import { useEffect, useState } from "react";
import { Globe, Copy, Check, ExternalLink, Lock, Save, CheckCircle, Image, Palette, Type, Eye } from "lucide-react";
import { useBusinessId } from "@/lib/useBusinessId";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const ACCENT_COLORS = [
  { hex: "#7c3aed", name: "Roxo" },
  { hex: "#2563eb", name: "Azul" },
  { hex: "#059669", name: "Verde" },
  { hex: "#dc2626", name: "Vermelho" },
  { hex: "#d97706", name: "Âmbar" },
  { hex: "#0891b2", name: "Ciano" },
  { hex: "#db2777", name: "Rosa" },
  { hex: "#374151", name: "Cinzento" },
];

export default function PublicPagePage() {
  const { business, loading } = useBusinessId();
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  // Customization fields (Empresarial only)
  const [accentColor, setAccentColor]     = useState("#7c3aed");
  const [welcomeMsg, setWelcomeMsg]       = useState("");
  const [bannerText, setBannerText]       = useState("");
  const [showBanner, setShowBanner]       = useState(false);
  const [customSlogan, setCustomSlogan]   = useState("");

  // Basic field (all plans)
  const [description, setDescription]    = useState("");

  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const isEmpresarial = business?.plan === "empresarial";

  useEffect(() => { setOrigin(window.location.origin); }, []);

  useEffect(() => {
    if (!business) return;
    setDescription(business.description || "");
    setWelcomeMsg(business.description || "");
    // Load empresarial settings from a JSON field if it exists
    try {
      const meta = (business as any).page_meta ? JSON.parse((business as any).page_meta) : {};
      if (meta.accentColor)  setAccentColor(meta.accentColor);
      if (meta.bannerText)   setBannerText(meta.bannerText);
      if (meta.showBanner !== undefined) setShowBanner(meta.showBanner);
      if (meta.customSlogan) setCustomSlogan(meta.customSlogan);
    } catch {}
  }, [business]);

  function copyLink() {
    if (!business) return;
    navigator.clipboard.writeText(`${origin}/book/${business.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSave() {
    if (!business) return;
    setSaving(true);

    const updates: Record<string, any> = { description: isEmpresarial ? welcomeMsg : description };

    if (isEmpresarial) {
      updates.page_meta = JSON.stringify({
        accentColor,
        bannerText,
        showBanner,
        customSlogan,
      });
    }

    const { error } = await supabase
      .from("businesses")
      .update(updates)
      .eq("id", business.id);

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const bookUrl = `${origin || "https://agendamoz.vercel.app"}/book/${business?.slug}`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Página Pública</h1>
        <p className="text-gray-500 text-sm mt-1">O link que os seus clientes usam para fazer reservas</p>
      </div>

      {/* Link card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Link de agendamento</p>
            <p className="text-gray-400 text-xs">Partilhe com os seus clientes</p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-3 flex items-center justify-between gap-2 mb-4">
          <p className="text-xs sm:text-sm text-gray-600 truncate min-w-0">{bookUrl}</p>
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 flex-shrink-0 bg-white border border-purple-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>

        <a
          href={`/book/${business?.slug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Abrir página pública
        </a>
      </div>

      {/* Customization */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="font-semibold text-gray-900">Personalização</p>
            <p className="text-gray-400 text-xs mt-0.5">Informações visíveis na página dos seus clientes</p>
          </div>
          {!isEmpresarial && (
            <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">Empresarial</span>
          )}
        </div>

        {/* ── ALL PLANS: Description ── */}
        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-1.5">
            <Type className="w-4 h-4 text-gray-400" />
            Descrição do negócio
          </label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Ex: Bem-vindo! Estamos disponíveis de segunda a sábado, das 8h às 18h."
            value={isEmpresarial ? welcomeMsg : description}
            onChange={(e) => isEmpresarial ? setWelcomeMsg(e.target.value) : setDescription(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1">Este texto aparece na página de agendamento dos seus clientes.</p>
        </div>

        {/* ── EMPRESARIAL ONLY ── */}
        {isEmpresarial ? (
          <div className="space-y-5">
            {/* Accent color */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-gray-400" />
                Cor de destaque da página
              </label>
              <div className="flex gap-2 flex-wrap">
                {ACCENT_COLORS.map(c => (
                  <button
                    key={c.hex}
                    onClick={() => setAccentColor(c.hex)}
                    title={c.name}
                    className={`w-9 h-9 rounded-xl border-2 transition-all hover:scale-110 focus:outline-none ${
                      accentColor === c.hex ? "border-gray-900 scale-110 ring-2 ring-offset-1 ring-gray-400" : "border-white shadow-sm"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
                {/* Custom hex input */}
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={e => setAccentColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border-2 border-gray-200 cursor-pointer p-0.5"
                    title="Cor personalizada"
                  />
                  <span className="text-xs text-gray-400 font-mono">{accentColor}</span>
                </div>
              </div>

              {/* Color preview */}
              <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
                <div className="h-2" style={{ backgroundColor: accentColor }} />
                <div className="bg-gray-50 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Pré-visualização da cor</span>
                  <button
                    className="text-xs font-semibold px-3 py-1 rounded-lg text-white transition-colors"
                    style={{ backgroundColor: accentColor }}
                  >
                    Reservar
                  </button>
                </div>
              </div>
            </div>

            {/* Slogan */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Slogan / Tagline</label>
              <input
                className="input"
                placeholder="Ex: A sua saúde em primeiro lugar"
                value={customSlogan}
                onChange={e => setCustomSlogan(e.target.value)}
                maxLength={80}
              />
              <p className="text-xs text-gray-400 mt-1">Aparece abaixo do nome do negócio. Máximo 80 caracteres.</p>
            </div>

            {/* Banner */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-gray-400" />
                  Banner de anúncio
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-gray-500">Activo</span>
                  <button
                    onClick={() => setShowBanner(!showBanner)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${showBanner ? "bg-purple-600" : "bg-gray-200"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${showBanner ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </label>
              </div>
              <input
                className={`input transition-opacity ${!showBanner ? "opacity-40" : ""}`}
                placeholder="Ex: 🎉 Promoção de abertura — 20% de desconto esta semana!"
                value={bannerText}
                onChange={e => setBannerText(e.target.value)}
                disabled={!showBanner}
                maxLength={120}
              />
              <p className="text-xs text-gray-400 mt-1">Aparece numa barra de topo na página dos clientes.</p>
            </div>
          </div>
        ) : (
          /* ── Locked preview for non-Empresarial ── */
          <div className="border border-dashed border-purple-200 rounded-xl p-4 sm:p-5 bg-purple-50/50 mt-2">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-purple-800 text-sm font-semibold mb-1">Mais personalização — Plano Empresarial</p>
                <p className="text-gray-600 text-xs mb-3">
                  Com o plano Empresarial pode personalizar a cor de destaque, slogan, banner de anúncio e muito mais na sua página pública.
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {["Cor de destaque", "Slogan personalizado", "Banner de anúncio"].map(f => (
                    <span key={f} className="bg-white border border-purple-200 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full">{f}</span>
                  ))}
                </div>
                <Link href="/dashboard/billing" className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors">
                  Actualizar para Empresarial →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          {saved && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium mb-4">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Alterações guardadas com sucesso!
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2 justify-center disabled:opacity-60"
            >
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />A guardar...</>
              ) : (
                <><Save className="w-4 h-4" />Guardar alterações</>
              )}
            </button>
            <a
              href={`/book/${business?.slug}`}
              target="_blank"
              rel="noreferrer"
              className="btn-outline flex items-center gap-2 justify-center"
            >
              <Eye className="w-4 h-4" />
              Ver página ao vivo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
