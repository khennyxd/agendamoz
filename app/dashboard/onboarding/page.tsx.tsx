"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";

function generateSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 40);
}

export default function OnboardingPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    businessName: "",
    businessType: "clinic",
    phone: "",
    address: "",
    slug: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const slug = form.slug || generateSlug(form.businessName);
    const res = await fetch("/api/create-business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner_id: user.id,
        name: form.businessName,
        slug,
        type: form.businessType,
        phone: form.phone,
        address: form.address,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao criar negócio. Tente novamente.");
      setSaving(false);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-teal-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold">Bem-vindo ao AgendaMoz!</h1>
          <p className="text-gray-500 text-sm mt-2">Precisamos de alguns detalhes sobre o seu negócio para começar</p>
        </div>

        <div className="card shadow-lg">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Nome do negócio</label>
              <input className="input" placeholder="Clínica Saúde Plena" value={form.businessName} onChange={(e) => { update("businessName", e.target.value); update("slug", generateSlug(e.target.value)); }} required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Tipo de negócio</label>
              <select className="input" value={form.businessType} onChange={(e) => update("businessType", e.target.value)}>
                <option value="clinic">Clínica / Consultório</option>
                <option value="salon">Salão / Spa</option>
                <option value="other">Outro serviço</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Telefone</label>
              <input className="input" placeholder="+258 84 000 0000" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Endereço</label>
              <input className="input" placeholder="Av. Julius Nyerere, Maputo" value={form.address} onChange={(e) => update("address", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Link da sua página</label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <span className="bg-gray-50 px-3 py-3 text-gray-500 text-sm border-r border-gray-200 flex-shrink-0">agendamoz.co.mz/book/</span>
                <input className="flex-1 px-3 py-3 text-sm focus:outline-none" placeholder="clinica-saude" value={form.slug} onChange={(e) => update("slug", generateSlug(e.target.value))} />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full justify-center mt-2">
              {saving ? "A guardar..." : "Criar o meu negócio →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
