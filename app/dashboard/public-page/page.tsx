"use client";

import { useEffect, useState } from "react";
import { Globe, Copy, Check, ExternalLink, Lock, Save, CheckCircle } from "lucide-react";
import { useBusinessId } from "@/lib/useBusinessId";
import { supabase, getPlanLimits } from "@/lib/supabase";
import Link from "next/link";

export default function PublicPagePage() {
  const { business, loading } = useBusinessId();
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const [accentColor, setAccentColor] = useState("#7c3aed");
  const [welcomeMsg, setWelcomeMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const limits = getPlanLimits(business?.plan || null);
  const isEmpresarial = business?.plan === "empresarial";

  useEffect(() => { setOrigin(window.location.origin); }, []);

  useEffect(() => {
    if (business) {
      setWelcomeMsg(business.description || "");
    }
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
    const { error } = await supabase
      .from("businesses")
      .update({ description: welcomeMsg })
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Página Pública</h1>
        <p className="text-gray-500 text-sm mt-1">O link que os seus clientes usam para fazer reservas</p>
      </div>

      {/* Link card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Link de agendamento</p>
            <p className="text-gray-400 text-xs">Partilhe com os seus clientes</p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 mb-4">
          <p className="text-sm text-gray-600 truncate">
            {origin || "https://agendamoz.vercel.app"}/book/{business?.slug}
          </p>
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
          className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Abrir página pública
        </a>
      </div>

      {/* Customization */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Personalização</p>
            <p className="text-gray-400 text-xs mt-0.5">Informações visíveis na página pública</p>
          </div>
          {!isEmpresarial && (
            <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2.5 py-1 rounded-full">Empresarial</span>
          )}
        </div>

        {isEmpresarial ? (
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Cor de destaque</label>
              <div className="flex gap-2 flex-wrap">
                {["#7c3aed","#2563eb","#059669","#dc2626","#d97706","#0891b2"].map(color => (
                  <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    className={`w-9 h-9 rounded-xl border-2 transition-all hover:scale-110 ${accentColor === color ? "border-gray-900 scale-110" : "border-white shadow-sm"}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Descrição / Mensagem de boas-vindas</label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Ex: Bem-vindo à Clínica Saúde Plena! Estamos disponíveis de segunda a sábado."
                value={welcomeMsg}
                onChange={(e) => setWelcomeMsg(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">Este texto aparece na página de agendamento dos seus clientes.</p>
            </div>
            {saved && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                Alterações guardadas com sucesso!
              </div>
            )}
            <button onClick={handleSave} disabled={saving} className="btn-primary self-start text-sm py-2.5 flex items-center gap-2 disabled:opacity-60">
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />A guardar...</> : <><Save className="w-4 h-4" />Guardar alterações</>}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Descrição do negócio</label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Ex: Clínica especializada em medicina geral, disponível de segunda a sábado."
                value={welcomeMsg}
                onChange={(e) => setWelcomeMsg(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">Este texto aparece na página de agendamento dos seus clientes.</p>
            </div>
            {saved && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                Alterações guardadas com sucesso!
              </div>
            )}
            <button onClick={handleSave} disabled={saving} className="btn-primary self-start text-sm py-2.5 flex items-center gap-2 disabled:opacity-60">
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />A guardar...</> : <><Save className="w-4 h-4" />Guardar alterações</>}
            </button>
            <div className="border border-dashed border-purple-200 rounded-xl p-4 bg-purple-50/50">
              <div className="flex items-center gap-2 mb-1.5">
                <Lock className="w-4 h-4 text-purple-400" />
                <p className="text-purple-700 text-sm font-semibold">Cor de destaque — Plano Empresarial</p>
              </div>
              <p className="text-gray-500 text-xs mb-3">Personalize a cor da página pública com a identidade do seu negócio.</p>
              <Link href="/dashboard/billing" className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors">
                Actualizar plano →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
