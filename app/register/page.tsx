"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

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

  async function handleGoogleRegister() {
    setLoadingGoogle(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard?onboarding=true` },
    });
    if (error) {
      setError("Erro ao entrar com Google. Tente novamente.");
      setLoadingGoogle(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }

    setLoading(true);
    setError("");

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name } },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar utilizador");

      const slug = form.slug || generateSlug(form.businessName);
      const res = await fetch("/api/create-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner_id: authData.user.id,
          name: form.businessName,
          slug,
          type: form.businessType,
          phone: form.phone,
          address: form.address,
        }),
      });
      const bizData = await res.json();
      if (!res.ok) throw new Error(bizData.error || "Erro ao criar negócio");

      // Show email confirmation message
      setEmailSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao registar. Tente novamente.";
      setError(message);
    }
    setLoading(false);
  }

  // Email sent screen
  if (emailSent) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold mb-3">Verifique o seu email</h1>
          <p className="text-gray-600 mb-2">
            Enviámos um email de confirmação para:
          </p>
          <p className="font-semibold text-teal-800 mb-6">{form.email}</p>
          <div className="bg-teal-50 rounded-2xl p-5 text-sm text-gray-600 text-left mb-6">
            <p className="font-semibold text-gray-800 mb-2">Próximos passos:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Abra o email que enviámos</li>
              <li>Clique no botão "Confirmar email"</li>
              <li>Será redirecionado para o seu painel</li>
            </ol>
          </div>
          <p className="text-gray-500 text-sm">
            Não recebeu?{" "}
            <button
              onClick={() => supabase.auth.resend({ type: "signup", email: form.email })}
              className="text-teal-700 font-semibold hover:text-teal-800"
            >
              Reenviar email
            </button>
          </p>
          <p className="text-gray-500 text-sm mt-3">
            Já confirmou?{" "}
            <Link href="/login" className="text-teal-700 font-semibold hover:text-teal-800">
              Entrar aqui
            </Link>
          </p>
        </div>
      </div>
    );
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
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${s <= step ? "bg-teal-800 text-white" : "bg-gray-200 text-gray-400"}`}>
                  {s}
                </div>
                {s < 2 && <div className={`flex-1 h-0.5 ${step > s ? "bg-teal-800" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          <h1 className="font-display text-2xl font-bold mb-1">
            {step === 1 ? "Criar conta" : "Sobre o seu negócio"}
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            {step === 1 ? "Comece gratuitamente, sem cartão de crédito" : "Personalize a sua página de agendamento"}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* Google button — only on step 1 */}
          {step === 1 && (
            <>
              <button
                onClick={handleGoogleRegister}
                disabled={loadingGoogle}
                className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 mb-5"
              >
                {loadingGoogle ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                {loadingGoogle ? "A entrar..." : "Registar com Google"}
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">ou com email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            </>
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
