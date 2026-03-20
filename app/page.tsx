"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Calendar, Clock, Users, Star, ChevronRight, CheckCircle, Menu, X, Stethoscope, Scissors, PhoneCall } from "lucide-react";

const features = [
  { icon: Calendar,  title: "Agenda Online 24/7",      desc: "Os seus clientes marcam consultas a qualquer hora, mesmo fora do horário de atendimento." },
  { icon: Clock,     title: "Sem Filas de Espera",     desc: "Elimine as filas. Cada cliente sabe exatamente o seu horário antes de chegar." },
  { icon: PhoneCall, title: "Lembretes Automáticos",   desc: "Reduza faltas com lembretes por SMS enviados automaticamente aos clientes." },
  { icon: Users,     title: "Gestão de Clientes",      desc: "Histórico completo de cada cliente, serviços e preferências num só lugar." },
];

const plans = [
  { name: "Básico",       price: "599",   desc: "Perfeito para começar",        features: ["Até 50 agendamentos/mês","1 funcionário","Página de reserva pública","Suporte por email"], highlight: false },
  { name: "Profissional", price: "1.299", desc: "Para negócios em crescimento", features: ["Agendamentos ilimitados","Até 5 funcionários","Lembretes por SMS","Relatórios mensais","Suporte prioritário"], highlight: true },
  { name: "Empresarial",  price: "2.499", desc: "Para múltiplas unidades",      features: ["Tudo no Profissional","Funcionários ilimitados","Múltiplas filiais","API de integração","Gestor de conta dedicado"], highlight: false },
];

const testimonials = [
  { name: "Dra. Fátima Muiane",  role: "Clínica Saúde Plena, Maputo", text: "Reduzi as faltas em 60% no primeiro mês. Os meus pacientes adoram poder marcar consultas pelo telemóvel.", rating: 5 },
  { name: "Carlos Nhantumbo",    role: "Salão Bela Forma, Matola",    text: "Antes perdia horas ao telefone a marcar horários. Agora foco no que sei fazer: trabalhar com os clientes.", rating: 5 },
  { name: "Dra. Amélia Sitoe",   role: "Clínica Vida, Beira",         text: "Sistema simples e em português. A equipa do AgendaMoz ajudou na configuração toda. Recomendo muito.", rating: 5 },
];

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/amlogo.svg" alt="AgendaMoz" className="h-24 w-auto" />
            <span className="font-display text-xl font-bold text-gray-900">AgendaMoz</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {["#funcionalidades","#precos","#testemunhos"].map((href,i) => (
              <a key={href} href={href} className="text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium">
                {["Funcionalidades","Preços","Testemunhos"][i]}
              </a>
            ))}
            <Link href="/login"    className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">Entrar</Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-5">Começar Grátis</Link>
          </div>
          <button className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 flex flex-col gap-4">
            <a href="#funcionalidades" className="text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Funcionalidades</a>
            <a href="#precos"          className="text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Preços</a>
            <a href="#testemunhos"     className="text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Testemunhos</a>
            <Link href="/login"    className="text-gray-700 font-medium">Entrar</Link>
            <Link href="/register" className="btn-primary text-center">Começar Grátis</Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-50 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-50 rounded-full translate-y-1/2 -translate-x-1/3" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.05] mb-6 animate-fade-up">
              Menos filas.{" "}
              <span className="text-purple-600">Mais clientes.</span>{" "}
              Melhor negócio.
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-xl leading-relaxed animate-fade-up anim-delay-100">
              Plataforma de agendamento para clínicas e salões em Moçambique. Os seus clientes marcam online — você foca no atendimento.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up anim-delay-200">
              <Link href="/register" className="btn-primary flex items-center justify-center gap-2 text-base group">
                Começar gratuitamente <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/book/demo" className="btn-outline flex items-center justify-center gap-2 text-base">Ver demonstração</Link>
            </div>
            <p className="mt-4 text-sm text-gray-500 animate-fade-up anim-delay-300">✓ Sem cartão de crédito &nbsp; ✓ Suporte em português</p>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
            {[
              { icon: Users,    label: "Clientes activos",   value: "1.200+" },
              { icon: Calendar, label: "Agendamentos feitos", value: "48.000+" },
              { icon: Star,     label: "Avaliação média",     value: "4.9 / 5" },
            ].map(({ icon: Icon, label, value }, i) => (
              <div key={label} className="card flex items-center gap-4 animate-fade-up" style={{animationDelay:`${400+i*100}ms`,opacity:0,animationFillMode:"forwards"}}>
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-purple-700">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BEFORE VS AFTER */}
      <section className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-purple-600 text-sm font-semibold uppercase tracking-widest mb-3">Transformação real</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Antes vs Depois</h2>
            <p className="text-gray-500 text-lg">Veja o impacto real nas clínicas e salões que usam o AgendaMoz</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ANTES */}
            <Reveal>
              <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center">
                    <span className="text-gray-500 font-bold text-lg">✕</span>
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold text-gray-700">Antes do AgendaMoz</p>
                    <p className="text-gray-500 text-sm">Gestão manual tradicional</p>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {[
                    { label: "Tempo de resposta",       value: "30 min – 4 horas" },
                    { label: "Taxa de faltas",           value: "20 – 40%" },
                    { label: "Horas ao telefone/dia",   value: "3 – 4 horas" },
                    { label: "Agendamentos perdidos",   value: "15 – 20/mês" },
                    { label: "Satisfação do cliente",   value: "3.5 / 5" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                      <p className="text-gray-600 text-sm">{label}</p>
                      <p className="font-semibold text-gray-700 text-sm">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 bg-gray-200 rounded-xl p-4">
                  <p className="text-gray-600 text-sm leading-relaxed"><strong className="text-gray-700">Resultado:</strong> Perda de clientes, equipa stressada e receita a escapar todos os meses.</p>
                </div>
              </div>
            </Reveal>

            {/* DEPOIS */}
            <Reveal>
              <div className="bg-purple-600 border-2 border-purple-600 rounded-2xl p-8 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">✓</span>
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold text-white">Com o AgendaMoz</p>
                    <p className="text-purple-200 text-sm">Agendamento automático online</p>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {[
                    { label: "Tempo de resposta",       value: "Instantâneo (24/7)", badge: "-99%" },
                    { label: "Taxa de faltas",           value: "5 – 8%",             badge: "-75%" },
                    { label: "Horas ao telefone/dia",   value: "30 minutos",          badge: "-85%" },
                    { label: "Agendamentos perdidos",   value: "0 – 2/mês",           badge: "-90%" },
                    { label: "Satisfação do cliente",   value: "4.9 / 5",             badge: "+40%" },
                  ].map(({ label, value, badge }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-white/20 last:border-0">
                      <p className="text-purple-100 text-sm">{label}</p>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white text-sm">{value}</p>
                        <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 bg-white/15 rounded-xl p-4">
                  <p className="text-purple-100 text-sm leading-relaxed"><strong className="text-white">Resultado:</strong> Mais clientes, equipa focada no atendimento e faturamento a crescer mês a mês.</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FOR WHO */}
      <section className="py-16 px-4 sm:px-6 bg-purple-50 border-y border-purple-100">
        <div className="max-w-6xl mx-auto text-center">
          <Reveal>
            <p className="text-purple-600 text-sm font-semibold uppercase tracking-widest mb-6">Ideal para</p>
            <div className="flex flex-col sm:flex-row justify-center gap-8">
              {[
                { icon: Stethoscope, label: "Clínicas & Consultórios", desc: "Médicos, dentistas, fisioterapeutas" },
                { icon: Scissors,    label: "Salões & Spas",            desc: "Cabeleireiros, manicures, massagens" },
                { icon: Users,       label: "Outros Serviços",          desc: "Fotógrafos, consultores, advogados" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex flex-col items-center gap-3 group cursor-default">
                  <div className="w-14 h-14 bg-white border border-purple-200 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:border-purple-600 group-hover:scale-110 transition-all duration-300 shadow-sm">
                    <Icon className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <p className="font-display text-lg font-bold text-gray-900">{label}</p>
                  <p className="text-gray-500 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURES */}
      <section id="funcionalidades" className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-purple-600 text-sm font-semibold uppercase tracking-widest mb-3">Funcionalidades</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900">Tudo o que precisa, nada do que não precisa</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <Reveal key={title}>
                <div className="card hover:scale-[1.02] transition-all duration-300 flex gap-5 group cursor-default h-full">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-gray-900 mb-1">{title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precos" className="py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-purple-600 text-sm font-semibold uppercase tracking-widest mb-3">Preços</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900">Simples e transparente</h2>
            <p className="text-gray-600 mt-3">Preços em Meticais. Sem surpresas.</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Reveal key={plan.name}>
                <div className={`rounded-2xl p-8 flex flex-col h-full transition-all duration-300 hover:scale-[1.02] ${
                  plan.highlight
                    ? "bg-purple-600 text-white shadow-xl scale-105"
                    : "bg-white border border-gray-200 shadow-sm"
                }`}>
                  {plan.highlight && <span className="bg-white text-purple-700 text-xs font-bold px-3 py-1 rounded-full self-start mb-4">MAIS POPULAR</span>}
                  <p className={`text-sm mb-1 ${plan.highlight ? "text-purple-200" : "text-gray-500"}`}>{plan.name}</p>
                  <p className={`font-display text-4xl font-bold mb-1 ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                    {plan.price} <span className={`text-lg font-normal ${plan.highlight ? "text-purple-200" : "text-gray-400"}`}>MZN/mês</span>
                  </p>
                  <p className={`text-sm mb-6 ${plan.highlight ? "text-purple-200" : "text-gray-500"}`}>{plan.desc}</p>
                  <ul className="flex flex-col gap-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? "text-purple-200" : "text-purple-500"}`} />
                        <span className={plan.highlight ? "text-white" : "text-gray-700"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className={`text-center py-3 rounded-xl font-semibold transition-all ${
                    plan.highlight
                      ? "bg-white text-purple-700 hover:bg-purple-50"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}>
                    Começar agora
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testemunhos" className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-purple-600 text-sm font-semibold uppercase tracking-widest mb-3">Testemunhos</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900">Empresas moçambicanas que confiam em nós</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Reveal key={t.name}>
                <div className="card hover:scale-[1.02] transition-all duration-300 flex flex-col gap-4 h-full">
                  <div className="flex gap-1">
                    {Array.from({ length: t.rating }).map((_,i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed italic">"{t.text}"</p>
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{t.role}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 bg-purple-600">
        <Reveal>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6">Pronto para transformar o seu negócio?</h2>
            <p className="text-purple-200 text-lg mb-10">Junte-se a mais de 1.200 profissionais que já usam o AgendaMoz.</p>
            <Link href="/register" className="bg-white text-purple-700 px-10 py-4 rounded-xl font-bold text-base inline-flex items-center gap-2 hover:bg-purple-50 transition-colors group">
              Começar gratuitamente — 14 dias grátis
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/amlogo.svg" alt="AgendaMoz" className="h-24 w-auto" />
              <span className="font-display text-white text-lg font-bold">AgendaMoz</span>
            </div>
            <p className="text-sm max-w-xs">Agendamentos simples para clínicas e salões em Moçambique.</p>
          </div>
          <div className="flex gap-12 text-sm">
            <div className="flex flex-col gap-2">
              <p className="text-white font-semibold mb-1">Produto</p>
              <a href="#funcionalidades" className="hover:text-purple-400 transition-colors">Funcionalidades</a>
              <a href="#precos"          className="hover:text-purple-400 transition-colors">Preços</a>
              <Link href="/register"     className="hover:text-purple-400 transition-colors">Registar</Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-white font-semibold mb-1">Legal</p>
              <Link href="/privacidade" className="hover:text-purple-400 transition-colors">Privacidade</Link>
              <Link href="/termos"      className="hover:text-purple-400 transition-colors">Termos</Link>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-gray-800 text-xs text-center">
          © {new Date().getFullYear()} AgendaMoz. Feito em Moçambique 🇲🇿
        </div>
      </footer>
    </div>
  );
}
