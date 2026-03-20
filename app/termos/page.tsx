import Link from "next/link";
import { Calendar } from "lucide-react";

export default function TermosPage() {
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
        <h1 className="font-display text-4xl font-bold text-white mb-3">Termos e Condições</h1>
        <p className="text-slate-500 text-sm mb-12">Última actualização: Março de 2026</p>

        <div className="space-y-10 text-slate-400 leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">1. Aceitação dos Termos</h2>
            <p>Ao criar uma conta e utilizar o AgendaMoz, concorda com estes Termos e Condições. Se não concordar, não utilize a plataforma.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">2. Descrição do Serviço</h2>
            <p>O AgendaMoz é uma plataforma de gestão de agendamentos destinada a clínicas, salões e outros negócios de prestação de serviços em Moçambique. Fornecemos ferramentas para gerir reservas, serviços e clientes.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">3. Subscrição e Pagamentos</h2>
            <p className="mb-3">O acesso completo à plataforma requer uma subscrição paga. Os pagamentos são processados via M-Pesa.</p>
            <ul className="list-disc list-inside space-y-2 text-slate-500">
              <li>As subscrições são mensais e renovadas automaticamente</li>
              <li>Os preços podem ser alterados com aviso prévio de 30 dias</li>
              <li>Não são efectuados reembolsos por períodos não utilizados</li>
              <li>O não pagamento resulta na suspensão do serviço</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">4. Responsabilidades do Utilizador</h2>
            <p className="mb-3">O utilizador é responsável por:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-500">
              <li>Manter a confidencialidade das credenciais de acesso</li>
              <li>Fornecer informações verídicas sobre o seu negócio</li>
              <li>Utilizar a plataforma de forma legal e ética</li>
              <li>Gerir correctamente os dados dos seus clientes</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">5. Limitação de Responsabilidade</h2>
            <p>O AgendaMoz não se responsabiliza por perdas decorrentes de falhas técnicas, interrupções do serviço ou uso indevido da plataforma. O serviço é fornecido "tal como está".</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">6. Cancelamento</h2>
            <p>Pode cancelar a sua subscrição a qualquer momento. Após o cancelamento, a sua conta continuará activa até ao fim do período pago. Os dados serão mantidos por 30 dias após o cancelamento.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">7. Alterações aos Termos</h2>
            <p>Reservamo-nos o direito de alterar estes termos. Notificaremos os utilizadores sobre alterações significativas por email com 15 dias de antecedência.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-white mb-3">8. Contacto</h2>
            <p>Para questões sobre estes termos: <a href="mailto:suporte@agendamoz.co.mz" className="text-azure-400 hover:text-azure-300">suporte@agendamoz.co.mz</a></p>
          </section>
        </div>
      </main>

      <footer className="border-t border-azure-900/50 py-6 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} AgendaMoz. Feito em Moçambique 🇲🇿
      </footer>
    </div>
  );
}
