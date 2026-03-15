# 🇲🇿 AgendaMoz — Plataforma de Agendamento para Moçambique

Sistema completo de agendamento para clínicas e salões em Moçambique.

---

## 🚀 Deploy em 5 passos

### 1. Criar projeto no Supabase
1. Vá a [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Crie um novo projeto
3. Vá a **SQL Editor** e execute todo o conteúdo de `supabase/schema.sql`
4. Copie as suas credenciais em **Settings > API**

### 2. Configurar variáveis de ambiente
Crie um ficheiro `.env.local` na raiz do projeto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
NEXT_PUBLIC_APP_URL=https://seudominio.vercel.app
```

### 3. Testar localmente
```bash
npm install
npm run dev
```
Aceda a http://localhost:3000

### 4. Deploy no Vercel
1. Faça push do código para o GitHub
2. Vá a [vercel.com](https://vercel.com) e importe o repositório
3. Em **Environment Variables**, adicione as mesmas variáveis do `.env.local`
4. Clique em **Deploy** — pronto!

### 5. Configurar autenticação no Supabase
No Supabase, vá a **Authentication > URL Configuration** e defina:
- **Site URL**: `https://seudominio.vercel.app`
- **Redirect URLs**: `https://seudominio.vercel.app/dashboard`

---

## 📁 Estrutura do projecto

```
agendamoz/
├── app/
│   ├── page.tsx                    # Landing page (marketing)
│   ├── login/page.tsx              # Login
│   ├── register/page.tsx           # Registo (2 passos)
│   ├── book/[slug]/page.tsx        # Página pública de agendamento
│   └── dashboard/
│       ├── layout.tsx              # Sidebar + navegação
│       ├── page.tsx                # Painel com estatísticas
│       ├── appointments/page.tsx   # Gestão de agendamentos
│       ├── services/page.tsx       # Gestão de serviços
│       └── settings/page.tsx       # Definições do negócio
├── lib/
│   └── supabase.ts                 # Cliente Supabase + tipos TypeScript
├── supabase/
│   └── schema.sql                  # Schema completo da base de dados
└── ...configurações
```

---

## ✨ Funcionalidades incluídas

- ✅ **Autenticação** completa (registo, login, logout)
- ✅ **Onboarding** em 2 passos (conta + negócio)
- ✅ **Painel** com estatísticas em tempo real
- ✅ **Gestão de agendamentos** (criar, filtrar, mudar estado)
- ✅ **Gestão de serviços** (criar, editar, apagar)
- ✅ **Página pública** de agendamento com URL personalizado
- ✅ **Calendário** de reservas com horários disponíveis
- ✅ **Definições** do perfil do negócio
- ✅ **RLS** (Row Level Security) no Supabase
- ✅ **Design responsivo** (mobile + desktop)
- ✅ **Totalmente em português**

---

## 🛠️ Stack tecnológica

| Tecnologia | Uso |
|------------|-----|
| Next.js 14 | Framework React (App Router) |
| TypeScript | Tipagem estática |
| Tailwind CSS | Estilização |
| Supabase | Base de dados + Autenticação |
| Vercel | Hosting + Deploy |

---

## 💰 Modelo de negócio sugerido

| Plano | Preço/mês | Funcionalidades |
|-------|-----------|-----------------|
| Básico | 599 MZN | 50 agendamentos, 1 utilizador |
| Profissional | 1.299 MZN | Ilimitado, 5 utilizadores, SMS |
| Empresarial | 2.499 MZN | Multi-filial, API, suporte dedicado |

Para implementar pagamentos, integre o **Mpesa API** (M-Pesa Mozambique) ou **Stripe**.

---

## 📞 Próximos passos sugeridos

1. **Notificações SMS** via Africa's Talking API (suporta Mozambique)
2. **Pagamentos** via M-Pesa (Vodacom API)
3. **Calendário visual** tipo Google Calendar
4. **Relatórios** PDF mensais
5. **App mobile** com React Native / Expo

---

*Feito com ❤️ para Moçambique 🇲🇿*
