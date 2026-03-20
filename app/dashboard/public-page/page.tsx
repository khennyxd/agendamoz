"use client";

import { useEffect, useState } from "react";
import { Globe, Copy, Check, ExternalLink, Lock } from "lucide-react";
import { useBusinessId } from "@/lib/useBusinessId";
import { getPlanLimits } from "@/lib/supabase";
import Link from "next/link";

export default function PublicPagePage() {
  const { business, loading } = useBusinessId();
  const [copied, setCopied] = useState(false);
  const limits = getPlanLimits(business?.plan || null);
  const isEmpresarial = business?.plan === "empresarial";

  function copyLink() {
    if (!business) return;
    navigator.clipboard.writeText(`${window.location.origin}/book/${business.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            {typeof window !== "undefined" ? window.location.origin : "https://agendamoz.vercel.app"}/book/{business?.slug}
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
            <p className="text-gray-400 text-xs mt-0.5">Logo, cores e informações da página</p>
          </div>
          {!isEmpresarial && (
            <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2.5 py-1 rounded-full">Empresarial</span>
          )}
        </div>

        {isEmpresarial ? (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Cor de destaque</label>
              <div className="flex gap-2">
                {["#7c3aed","#2563eb","#059669","#dc2626","#d97706","#0891b2"].map(color => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded-lg border-2 border-white shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Mensagem de boas-vindas</label>
              <input className="input" placeholder="Ex: Bem-vindo à Clínica Saúde Plena!" />
            </div>
            <button className="btn-primary self-start text-sm py-2.5">Guardar personalização</button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm mb-1 font-medium">Disponível no plano Empresarial</p>
            <p className="text-gray-400 text-xs mb-4">Personalize a sua página com logo, cores e mensagem de boas-vindas</p>
            <Link href="/dashboard/billing" className="btn-primary text-sm py-2.5 inline-flex">
              Actualizar plano →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
