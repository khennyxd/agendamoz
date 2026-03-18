"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Calendar, Clock, Users, Star, ChevronRight,
  CheckCircle, Menu, X, Stethoscope, Scissors, PhoneCall, Zap, Shield, BarChart3,
} from "lucide-react";

const features = [
  { icon: Calendar,  title: "Agenda Online 24/7",      desc: "Os seus clientes marcam consultas a qualquer hora, mesmo fora do horário de atendimento." },
  { icon: Clock,     title: "Sem Filas de Espera",     desc: "Elimine as filas. Cada cliente sabe exactamente o seu horário antes de chegar." },
  { icon: PhoneCall, title: "Lembretes Automáticos",   desc: "Reduza faltas com lembretes enviados automaticamente aos clientes." },
  { icon: BarChart3, title: "Relatórios em Tempo Real",desc: "Acompanhe o crescimento do seu negócio com estatísticas detalhadas no painel." },
  { icon: Shield,    title: "Dados Seguros",            desc: "A sua informação e a dos seus clientes protegida com encriptação de nível bancário." },
  { icon: Zap,       title: "Activação Imediata",      desc: "Em menos de 5 minutos o seu negócio está online e a receber reservas." },
];

const plans = [
  {
    id: "basico", name: "Básico", price: "599",
    desc: "Perfeito para começar",
    features: ["Até 50 agendamentos/mês", "1 funcionário", "Página de reserva pública", "Suporte por email"],
    highlight: false,
  },
  {
    id: "profissional", name: "Profissional", price: "1.299",
    desc: "Para negócios em crescimento",
    features: ["Agendamentos ilimitados", "Até 5 funcionários", "Lembretes automáticos", "Relatórios mensais", "Suporte prioritário"],
    highlight: true,
  },
  {
    id: "empresarial", name: "Empresarial", price: "2.499",
    desc: "Para múltiplas unidades",
    features: ["Tudo no Profissional", "Funcionários ilimitados", "Múltiplas filiais", "API de integração", "Gestor de conta dedicado"],
    highlight: false,
  },
];

const testimonials = [
  { name: "Dra. Fátima Muiane",   role: "Clínica Saúde Plena, Maputo", text: "Reduzi as faltas em 60% no primeiro mês. Os meus pacientes adoram poder marcar consultas pelo telemóvel.", rating: 5 },
  { name: "Carlos Nhantumbo",     role: "Salão Bela Forma, Matola",    text: "Antes perdia horas ao telefone a marcar horários. Agora foco no que sei fazer: trabalhar com os clientes.", rating: 5 },
  { name: "Dra. Amélia Sitoe",    role: "Clínica Vida, Beira",         text: "Sistema simples e em português. A equipa do AgendaMoz ajudou na configuração toda. Recomendo muito.", rating: 5 },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-200 overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-obsidian-900/95 backdrop-blur-xl border-b border-[rgba(0,229,255,0.08)]" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-cyan-sm">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white">AgendaMoz</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {["#funcionalidades","#precos","#testemunhos"].map((href, i) => (
              <a key={href} href={href} className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">
                {["Funcionalidades","Preços","Testemunhos"][i]}
              </a>
            ))}
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Entrar</Link>
            <Link href="/register" className="btn-primary py-2 px-5 text-sm">Começar Grátis</Link>
          </div>

          <button className="md:hidden p-2 text-slate-400 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-obsidian-900/98 backdrop-blur-xl border-t border-[rgba(0,229,255,0.08)] px-4 py-5 flex flex-col gap-4">
            <a href="#funcionalidades" className="text-slate-300" onClick={() => setMenuOpen(false)}>Funcionalidades</a>
            <a href="#precos" className="text-slate-300" onClick={() => setMenuOpen(false)}>Preços</a>
            <a href="#testemunhos" className="text-slate-300" onClick={() => setMenuOpen(false)}>Testemunhos</a>
            <Link href="/login" className="text-slate-300">Entrar</Link>
            <Link href="/register" className="btn-primary text-center">Começar Grátis</Link>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-20 pb-16 px-4 sm:px-6 cyber-bg overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/3 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto w-full">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 border border-cyan-400/20 bg-cyan-400/5 text-cyan-400 text-xs font-semibold px-4 py-2 rounded-full mb-8 animate-fade-in">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              Tecnologia de agendamento para Moçambique
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[0.95] mb-8 animate-fade-up">
              O futuro dos<br />
              <span className="text-gradient">agendamentos</span><br />
              chegou a Moz.
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-xl leading-relaxed animate-fade-up anim-delay-100">
              Plataforma inteligente de agendamento para clínicas e salões. Os seus clientes reservam online — você foca no atendimento.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up anim-delay-200">
              <Link href="/register" className="btn-primary text-base px-8 py-4">
                Começar gratuitamente
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link href="/book/demo" className="btn-outline text-base px-8 py-4">
                Ver demonstração
              </Link>
            </div>

            <p className="mt-5 text-sm text-slate-600 animate-fade-up anim-delay-300">
              ✓ Sem cartão de crédito &nbsp;·&nbsp; ✓ Configuração em 5 min &nbsp;·&nbsp; ✓ Suporte em português
            </p>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-4 max-w-lg">
            {[
              { value: "1.200+", label: "Clientes activos" },
              { value: "48K+",   label: "Agendamentos" },
              { value: "4.9★",   label: "Avaliação" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center animate-fade-up anim-delay-400">
                <p className="font-display text-2xl sm:text-3xl font-black text-gradient">{value}</p>
                <p className="text-xs text-slate-600 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR WHO ── */}
      <section className="py-16 px-4 sm:px-6 border-y border-[rgba(0,229,255,0.08)]">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-slate-600 text-xs font-semibold uppercase tracking-widest mb-8">Ideal para</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            {[
              { icon: Stethoscope, label: "Clínicas & Consultórios", desc: "Médicos, dentistas, fisioterapeutas" },
              { icon: Scissors,    label: "Salões & Spas",            desc: "Cabeleireiros, manicures, massagens" },
              { icon: Users,       label: "Outros Serviços",          desc: "Fotógrafos, consultores, advogados" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4 bg-obsidian-800 border border-[rgba(0,229,255,0.08)] rounded-2xl px-6 py-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="font-display font-bold text-white text-sm">{label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="funcionalidades" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-4">Funcionalidades</p>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-white">
              Tudo o que precisa,<br /><span className="text-gradient">nada do que não precisa</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group card hover:border-cyan-400/25 hover:shadow-cyan-sm transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-500/10 border border-cyan-400/20 flex items-center justify-center mb-4 group-hover:shadow-cyan-sm transition-all">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-display font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="precos" className="py-24 px-4 sm:px-6 cyber-bg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-4">Preços</p>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-white">Simples e transparente</h2>
            <p className="text-slate-500 mt-3">Preços em Meticais. Sem surpresas.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 flex flex-col transition-all duration-300 ${
                  plan.highlight
                    ? "bg-gradient-to-b from-cyan-400/10 to-violet-500/10 border-2 border-cyan-400/40 shadow-cyan-md scale-105"
                    : "bg-obsidian-800 border border-[rgba(0,229,255,0.08)] hover:border-cyan-400/20"
                }`}
              >
                {plan.highlight && (
                  <span className="bg-gradient-to-r from-cyan-400 to-violet-500 text-obsidian-950 text-xs font-black px-3 py-1 rounded-full self-start mb-4 uppercase tracking-wide">
                    Mais Popular
                  </span>
                )}
                <p className="text-slate-500 text-sm mb-1">{plan.name}</p>
                <p className="font-display text-4xl font-black text-white mb-1">
                  {plan.price} <span className="text-base font-normal text-slate-500">MZN/mês</span>
                </p>
                <p className="text-slate-600 text-xs mb-6">{plan.desc}</p>

                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? "text-cyan-400" : "text-slate-600"}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`text-center py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                    plan.highlight
                      ? "bg-gradient-to-r from-cyan-400 to-violet-500 text-obsidian-950 hover:opacity-90 shadow-cyan-sm"
                      : "border border-[rgba(0,229,255,0.2)] text-slate-300 hover:border-cyan-400/40 hover:text-white"
                  }`}
                >
                  Começar agora
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testemunhos" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-4">Testemunhos</p>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-white">
              Empresas moçambicanas<br /><span className="text-gradient">que confiam em nós</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card hover:border-cyan-400/20 hover:shadow-cyan-sm transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-gold-500 fill-gold-500" />
                  ))}
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="mt-auto pt-4 border-t border-[rgba(0,229,255,0.08)]">
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-slate-600 text-xs mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 sm:px-6 cyber-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-glow-cyan opacity-30 pointer-events-none" />
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-black text-white mb-6">
            Pronto para <span className="text-gradient">transformar</span><br />o seu negócio?
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            Junte-se a mais de 1.200 profissionais que já usam o AgendaMoz.
          </p>
          <Link href="/register" className="btn-primary text-base px-10 py-4 inline-flex">
            Começar gratuitamente
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[rgba(0,229,255,0.08)] py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-display text-white text-lg font-bold">AgendaMoz</span>
            </div>
            <p className="text-slate-600 text-sm max-w-xs">
              Agendamentos inteligentes para clínicas e salões em Moçambique.
            </p>
          </div>

          <div className="flex gap-12 text-sm">
            <div className="flex flex-col gap-2">
              <p className="text-white font-semibold mb-1">Produto</p>
              <a href="#funcionalidades" className="text-slate-500 hover:text-cyan-400 transition-colors">Funcionalidades</a>
              <a href="#precos" className="text-slate-500 hover:text-cyan-400 transition-colors">Preços</a>
              <Link href="/register" className="text-slate-500 hover:text-cyan-400 transition-colors">Registar</Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-white font-semibold mb-1">Legal</p>
              <Link href="/privacidade" className="text-slate-500 hover:text-cyan-400 transition-colors">Privacidade</Link>
              <Link href="/termos" className="text-slate-500 hover:text-cyan-400 transition-colors">Termos</Link>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-[rgba(0,229,255,0.06)] text-xs text-center text-slate-700">
          © {new Date().getFullYear()} AgendaMoz. Feito em Moçambique 🇲🇿
        </div>
      </footer>
    </div>
  );
}
