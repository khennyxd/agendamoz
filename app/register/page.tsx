"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 = account info, 2 = business info
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    businessName: "",
    businessType: "clinic",
    phone: "",
    address: "",
    slug: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 40);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }

    setLoading(true);
    setError("");

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name } },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar utilizador");

      // 2. Create business
      const slug = form.slug || generateSlug(form.businessName);
      const { error: bizError } = await supabase.from("businesses").insert({
        owner_id: authData.user.id,
        name: form.businessName,
        slug,
        type: form.businessType,
        phone: form.phone,
        address: form.address,
        description: "",
      });

      if (bizError) throw bizError;

      router.push("/dashboard?onboarding=true");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao registar. Tente novamente.";
      setError(message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-teal-800 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-teal-800">AgendaMoz</span>
          </Link>
        </div>

        <div className="card shadow-lg">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    s <= step ? "bg-teal-800 text-white" : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {s}
                </div>
                {s < 2 && <div className={`flex-1 h-0.5 ${step > s ? "bg-teal-800" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          <h1 className="font-display text-2xl font-bold mb-1">
            {step === 1 ? "Criar conta" : "Sobre o seu negócio"}
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            {step === 1 ? "Comece gratuitamente, sem cartão de crédito" : "Personalise a sua página de agendamento"}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Nome completo</label>
                  <input className="input" placeholder="Dr. João Silva" value={form.name} onChange={(e) => update("name", e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Email</label>
                  <input type="email" className="input" placeholder="o-seu@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Senha</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} className="input pr-12" placeholder="Mínimo 8 caracteres" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={8} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Nome do negócio</label>
                  <input
                    className="input"
                    placeholder="Clínica Saúde Plena"
                    value={form.businessName}
                    onChange={(e) => {
                      update("businessName", e.target.value);
                      update("slug", generateSlug(e.target.value));
                    }}
                    required
                  />
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
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Link da sua página de agendamento</label>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <span className="bg-gray-50 px-3 py-3 text-gray-500 text-sm border-r border-gray-200 flex-shrink-0">agendamoz.co.mz/book/</span>
                    <input
                      className="flex-1 px-3 py-3 text-sm focus:outline-none"
                      placeholder="clinica-saude"
                      value={form.slug}
                      onChange={(e) => update("slug", generateSlug(e.target.value))}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 mt-2">
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1 justify-center">
                  Voltar
                </button>
              )}
              <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                {loading ? "A criar..." : step === 1 ? "Continuar" : "Criar conta"}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem conta?{" "}
            <Link href="/login" className="text-teal-700 font-semibold hover:text-teal-800">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
