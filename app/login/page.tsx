"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email ou senha incorretos. Tente novamente.");
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-teal-800 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-teal-800">AgendaMoz</span>
          </Link>
        </div>

        <div className="card shadow-lg">
          <h1 className="font-display text-2xl font-bold mb-1">Bem-vindo de volta</h1>
          <p className="text-gray-500 text-sm mb-8">Entre na sua conta para continuar</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Email</label>
              <input
                type="email"
                className="input"
                placeholder="o-seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="/reset-password" className="text-sm text-teal-700 hover:text-teal-800">
                Esqueceu a senha?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? "A entrar..." : "Entrar"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Não tem conta?{" "}
            <Link href="/register" className="text-teal-700 font-semibold hover:text-teal-800">
              Registar gratuitamente
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
