"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Calendar, Clock, Users, Star, ChevronRight, CheckCircle, Menu, X, Stethoscope, Scissors, PhoneCall } from "lucide-react";

const features = [
  { icon: Calendar,  title: "Agenda Online 24/7",      desc: "Os seus clientes marcam consultas a qualquer hora, mesmo fora do horário de atendimento." },
  { icon: Clock,     title: "Sem Filas de Espera",     desc: "Elimine as filas. Cada cliente sabe exatamente o seu horário antes de chegar." },
  { icon: PhoneCall, title: "Lembretes Automáticos",   desc: "Reduza faltas com lembretes por SMS enviados automaticamente aos clientes." },
  { icon: Users,     title: "Gestão de Clientes",      desc: "Histórico completo de cada cliente, serviços e preferências num só lugar." },
];

const plans = [
  { name: "Básico",        price: "599",   desc: "Perfeito para começar",         features: ["Até 50 agendamentos/mês","1 funcionário","Página de reserva pública","Suporte por email"], highlight: false },
  { name: "Profissional",  price: "1.299", desc: "Para negócios em crescimento",  features: ["Agendamentos ilimitados","Até 5 funcionários","Lembretes por SMS","Relatórios mensais","Suporte prioritário"], highlight: true },
  { name: "Empresarial",   price: "2.499", desc: "Para múltiplas unidades",       features: ["Tudo no Profissional","Funcionários ilimitados","Múltiplas filiais","API de integração","Gestor de conta dedicado"], highlight: false },
];

const testimonials = [
  { name: "Dra. Fátima Muiane",  role: "Clínica Saúde Plena, Maputo", text: "Reduzi as faltas em 60% no primeiro mês. Os meus pacientes adoram poder marcar consultas pelo telemóvel.", rating: 5 },
  { name: "Carlos Nhantumbo",    role: "Salão Bela Forma, Matola",    text: "Antes perdia horas ao telefone a marcar horários. Agora foco no que sei fazer: trabalhar com os clientes.", rating: 5 },
  { name: "Dra. Amélia Sitoe",   role: "Clínica Vida, Beira",         text: "Sistema simples e em português. A equipa do AgendaMoz ajudou na configuração toda. Recomendo muito.", rating: 5 },
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
    <div className="min-h-screen bg-[#050508] text-slate-300 overflow-x-hidden">

      {/* NAV */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-night-900/95 backdrop-blur-md border-b border-azure-900" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-azure-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white">AgendaMoz</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#funcionalidades" className="text-sm text-slate-400 hover:text-azure-300 transition-colors">Funcionalidades</a>
            <a href="#precos"          className="text-sm text-slate-400 hover:text-azure-300 transition-colors">Preços</a>
            <a href="#testemunhos"     className="text-sm text-slate-400 hover:text-azure-300 transition-colors">Testemunhos</a>
            <Link href="/login"    className="text-sm text-slate-400 hover:text-white transition-colors">Entrar</Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-5">Começar Grátis</Link>
          </div>
          <button className="md:hidden p-2 text-slate-400" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-night-900/98 border-t border-azure-900 px-4 py-4 flex flex-col gap-4">
            <a href="#funcionalidades" className="text-slate-300" onClick={() => setMenuOpen(false)}>Funcionalidades</a>
            <a href="#precos"          className="text-slate-300" onClick={() => setMenuOpen(false)}>Preços</a>
            <a href="#testemunhos"     className="text-slate-300" onClick={() => setMenuOpen(false)}>Testemunhos</a>
            <Link href="/login"    className="text-slate-300">Entrar</Link>
            <Link href="/register" className="btn-primary text-center">Começar Grátis</Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-azure-600/8 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-azure-700/6 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-azure-600/10 border border-azure-700/30 text-azure-300 text-sm font-semibold px-4 py-2 rounded-full mb-6 animate-fade-in">
              <span className="w-2 h-2 bg-azure-400 rounded-full animate-pulse" />
              Feito para Moçambique
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6 animate-fade-up">
              Menos filas.{" "}
              <span className="text-azure-400">Mais clientes.</span>{" "}
              Melhor negócio.
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-xl leading-relaxed animate-fade-up anim-delay-100">
              Plataforma de agendamento para clínicas e salões em Moçambique. Os seus clientes marcam online — você foca no atendimento.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up anim-delay-200">
              <Link href="/register" className="btn-primary flex items-center justify-center gap-2 text-base">
                Começar gratuitamente <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/book/demo" className="btn-outline flex items-center justify-center gap-2 text-base">
                Ver demonstração
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-600 animate-fade-up anim-delay-300">
              ✓ Sem cartão de crédito &nbsp; ✓ Suporte em português
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
            {[
              { icon: Users,    label: "Clientes activos",   value: "1.200+" },
              { icon: Calendar, label: "Agendamentos feitos", value: "48.000+" },
              { icon: Star,     label: "Avaliação média",     value: "4.9 / 5" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="card flex items-center gap-4 animate-fade-up anim-delay-400">
                <div className="w-10 h-10 bg-azure-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-azure-400" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-azure-300">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR WHO */}
      <section className="py-16 px-4 sm:px-6 bg-night-800 border-y border-azure-900/50">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-azure-400 text-sm font-semibold uppercase tracking-widest mb-6">Ideal para</p>
          <div className="flex flex-col sm:flex-row justify-center gap-8">
            {[
              { icon: Stethoscope, label: "Clínicas & Consultórios", desc: "Médicos, dentistas, fisioterapeutas" },
              { icon: Scissors,    label: "Salões & Spas",            desc: "Cabeleireiros, manicures, massagens" },
              { icon: Users,       label: "Outros Serviços",          desc: "Fotógrafos, consultores, advogados" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-azure-600/15 border border-azure-700/30 rounded-2xl flex items-center justify-center">
                  <Icon className="w-7 h-7 text-azure-400" />
                </div>
                <p className="font-display text-lg font-semibold text-white">{label}</p>
                <p className="text-slate-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="funcionalidades" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-azure-400 text-sm font-semibold uppercase tracking-widest mb-3">Funcionalidades</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white">Tudo o que precisa, nada do que não precisa</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card hover:border-azure-600/40 flex gap-5">
                <div className="w-12 h-12 bg-azure-600/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-azure-400" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-white mb-1">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precos" className="py-24 px-4 sm:px-6 bg-night-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-azure-400 text-sm font-semibold uppercase tracking-widest mb-3">Preços</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white">Simples e transparente</h2>
            <p className="text-slate-500 mt-3">Preços em Meticais. Sem surpresas.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-8 flex flex-col ${plan.highlight ? "bg-azure-600/15 border-2 border-azure-500/50 shadow-lg scale-105" : "bg-night-700 border border-azure-900/50"}`}>
                {plan.highlight && <span className="bg-azure-500 text-white text-xs font-bold px-3 py-1 rounded-full self-start mb-4">MAIS POPULAR</span>}
                <p className="text-slate-500 text-sm mb-1">{plan.name}</p>
                <p className="font-display text-4xl font-bold text-white mb-1">{plan.price} <span className="text-lg font-normal text-slate-500">MZN/mês</span></p>
                <p className="text-slate-600 text-sm mb-6">{plan.desc}</p>
                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? "text-azure-400" : "text-slate-600"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`text-center py-3 rounded-xl font-semibold transition-all ${plan.highlight ? "bg-azure-500 text-white hover:bg-azure-400" : "border border-azure-800 text-slate-400 hover:border-azure-500 hover:text-white"}`}>
                  Começar agora
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testemunhos" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-azure-400 text-sm font-semibold uppercase tracking-widest mb-3">Testemunhos</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white">Empresas moçambicanas que confiam em nós</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card hover:border-azure-700/40 flex flex-col gap-4">
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />)}
                </div>
                <p className="text-slate-400 text-sm leading-relaxed italic">"{t.text}"</p>
                <div className="mt-auto pt-4 border-t border-azure-900/50">
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-slate-600 text-xs mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 bg-azure-600/8 border-y border-azure-800/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6">Pronto para transformar o seu negócio?</h2>
          <p className="text-slate-400 text-lg mb-10">Junte-se a mais de 1.200 profissionais que já usam o AgendaMoz.</p>
          <Link href="/register" className="btn-primary text-base inline-flex items-center gap-2">
            Começar gratuitamente — 14 dias grátis <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-night-900 text-slate-500 py-12 px-4 sm:px-6 border-t border-azure-900/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-azure-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-display text-white text-lg font-bold">AgendaMoz</span>
            </div>
            <p className="text-sm max-w-xs">Agendamentos simples para clínicas e salões em Moçambique.</p>
          </div>
          <div className="flex gap-12 text-sm">
            <div className="flex flex-col gap-2">
              <p className="text-white font-semibold mb-1">Produto</p>
              <a href="#funcionalidades" className="hover:text-azure-400 transition-colors">Funcionalidades</a>
              <a href="#precos"          className="hover:text-azure-400 transition-colors">Preços</a>
              <Link href="/register"     className="hover:text-azure-400 transition-colors">Registar</Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-white font-semibold mb-1">Legal</p>
              <Link href="/privacidade" className="hover:text-azure-400 transition-colors">Privacidade</Link>
              <Link href="/termos"      className="hover:text-azure-400 transition-colors">Termos</Link>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-azure-900/30 text-xs text-center">
          © {new Date().getFullYear()} AgendaMoz. Feito em Moçambique 🇲🇿
        </div>
      </footer>
    </div>
  );
}
