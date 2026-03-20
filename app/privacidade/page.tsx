import Link from "next/link";
import { Calendar } from "lucide-react";

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#050508] text-slate-300">
      {/* Header */}
      <header className="border-b border-azure-900/50 px-4 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/amlogo.svg" alt="AgendaMoz" className="h-8 w-auto" />
            <span className="font-display text-xl font-bold text-white">AgendaMoz</span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-azure-400 transition-colors">← Voltar</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="font-display text-4xl font-bold text-white mb-3">Política de Privacidade</h1>
        <p className="text-slate-500 text-sm mb-12">Última actualização: Março de 2026</p>

        <div className="space-y-10 text-slate-400 leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">1. Introdução</h2>
            <p>O AgendaMoz ("nós", "nosso") respeita a privacidade dos seus utilizadores. Esta Política de Privacidade descreve como recolhemos, usamos e protegemos as informações pessoais quando utiliza a nossa plataforma de agendamento.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">2. Informações que Recolhemos</h2>
            <p className="mb-3">Recolhemos as seguintes informações:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-500">
              <li><strong className="text-slate-300">Informações de registo:</strong> nome, endereço de email e senha</li>
              <li><strong className="text-slate-300">Informações do negócio:</strong> nome do negócio, telefone e endereço</li>
              <li><strong className="text-slate-300">Dados de agendamentos:</strong> nome e telefone dos clientes, datas e horários</li>
              <li><strong className="text-slate-300">Dados de pagamento:</strong> referências de transacções M-Pesa</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">3. Como Usamos as Informações</h2>
            <p className="mb-3">Usamos as suas informações para:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-500">
              <li>Fornecer e melhorar os nossos serviços de agendamento</li>
              <li>Processar pagamentos e activar subscrições</li>
              <li>Enviar notificações sobre agendamentos</li>
              <li>Suporte ao cliente e comunicações importantes</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">4. Partilha de Informações</h2>
            <p>Não vendemos nem partilhamos as suas informações pessoais com terceiros, excepto quando necessário para prestar os nossos serviços (ex: processamento de pagamentos) ou quando exigido por lei.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">5. Segurança dos Dados</h2>
            <p>Os seus dados são armazenados de forma segura através da plataforma Supabase, com encriptação em trânsito e em repouso. Implementamos medidas de segurança para proteger contra acesso não autorizado.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">6. Os Seus Direitos</h2>
            <p className="mb-3">Tem o direito de:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-500">
              <li>Aceder às suas informações pessoais</li>
              <li>Corrigir dados incorrectos</li>
              <li>Solicitar a eliminação da sua conta e dados</li>
              <li>Exportar os seus dados</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">7. Contacto</h2>
            <p>Para questões sobre privacidade, entre em contacto connosco através do email: <a href="mailto:privacidade@agendamoz.co.mz" className="text-azure-400 hover:text-azure-300">privacidade@agendamoz.co.mz</a></p>
          </section>
        </div>
      </main>

      <footer className="border-t border-azure-900/50 py-6 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} AgendaMoz. Feito em Moçambique 🇲🇿
      </footer>
    </div>
  );
}
