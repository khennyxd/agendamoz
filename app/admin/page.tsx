"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, Clock, Calendar, Users, DollarSign } from "lucide-react";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";

const ADMIN_EMAIL = "khensaniorlando@gmail.com";

type Payment = {
  id: string;
  business_id: string;
  plan: string;
  amount_mzn: number;
  mpesa_reference: string;
  status: "pending" | "confirmed" | "rejected";
  created_at: string;
  business?: {
    name: string;
    slug: string;
    phone: string;
    owner_id: string;
  };
};

type Business = {
  id: string;
  name: string;
  slug: string;
  phone: string;
  is_active: boolean;
  plan: string | null;
  created_at: string;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
};

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [tab, setTab] = useState<"payments" | "businesses">("payments");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push("/dashboard");
        return;
      }
      setAuthorized(true);
      await fetchData();
      setLoading(false);
    }
    load();
  }, [router]);

  async function fetchData() {
    const [{ data: pays }, { data: bizs }] = await Promise.all([
      supabase.from("payments").select("*, business:businesses(name, slug, phone, owner_id)").order("created_at", { ascending: false }),
      supabase.from("businesses").select("*").order("created_at", { ascending: false }),
    ]);
    setPayments(pays || []);
    setBusinesses(bizs || []);
  }

  async function confirmPayment(payment: Payment) {
    setProcessing(payment.id);
    
    // 1. Update payment status
    await supabase.from("payments").update({ status: "confirmed", confirmed_at: new Date().toISOString() }).eq("id", payment.id);
    
    // 2. Activate business
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
    
    await supabase.from("businesses").update({
      is_active: true,
      plan: payment.plan,
      subscription_ends_at: subscriptionEnd.toISOString(),
    }).eq("id", payment.business_id);

    await fetchData();
    setProcessing(null);
  }

  async function rejectPayment(paymentId: string) {
    setProcessing(paymentId);
    await supabase.from("payments").update({ status: "rejected" }).eq("id", paymentId);
    await fetchData();
    setProcessing(null);
  }

  async function toggleBusiness(biz: Business) {
    setProcessing(biz.id);
    await supabase.from("businesses").update({ is_active: !biz.is_active }).eq("id", biz.id);
    await fetchData();
    setProcessing(null);
  }

  const pendingPayments = payments.filter(p => p.status === "pending");
  const activeBusinesses = businesses.filter(b => b.is_active).length;
  const totalRevenue = payments.filter(p => p.status === "confirmed").reduce((sum, p) => sum + p.amount_mzn, 0);

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-teal-800 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-teal-800 text-white px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Painel de Admin</h1>
            <p className="text-teal-300 text-sm">AgendaMoz — Gestão de clientes e pagamentos</p>
          </div>
          <button onClick={() => router.push("/dashboard")} className="text-sm text-teal-300 hover:text-white">
            ← Voltar ao dashboard
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Pagamentos pendentes", value: pendingPayments.length, icon: Clock, color: "amber" },
            { label: "Negócios activos", value: activeBusinesses, icon: CheckCircle, color: "green" },
            { label: "Total de negócios", value: businesses.length, icon: Users, color: "teal" },
            { label: "Receita total", value: `${totalRevenue.toLocaleString("pt-MZ")} MZN`, icon: DollarSign, color: "teal" },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-teal-700" />
              </div>
              <p className="font-display text-2xl font-bold">{value}</p>
              <p className="text-gray-500 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("payments")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === "payments" ? "bg-teal-800 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
          >
            Pagamentos {pendingPayments.length > 0 && <span className="ml-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingPayments.length}</span>}
          </button>
          <button
            onClick={() => setTab("businesses")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === "businesses" ? "bg-teal-800 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
          >
            Negócios
          </button>
        </div>

        {/* Payments tab */}
        {tab === "payments" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {payments.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <DollarSign className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p>Nenhum pagamento ainda</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">Negócio</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Plano</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Valor</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Referência M-Pesa</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Data</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Estado</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Acções</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payments.map((p) => (
                      <tr key={p.id} className={p.status === "pending" ? "bg-amber-50/30" : ""}>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-sm">{p.business?.name || "—"}</p>
                          <p className="text-gray-500 text-xs">{p.business?.phone}</p>
                        </td>
                        <td className="px-4 py-4 text-sm capitalize">{p.plan}</td>
                        <td className="px-4 py-4 text-sm font-semibold">{p.amount_mzn} MZN</td>
                        <td className="px-4 py-4">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded-lg">{p.mpesa_reference}</span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {format(parseISO(p.created_at), "d MMM yyyy HH:mm", { locale: pt })}
                        </td>
                        <td className="px-4 py-4">
                          {p.status === "pending" && <span className="badge-pending">Pendente</span>}
                          {p.status === "confirmed" && <span className="badge-confirmed">Confirmado</span>}
                          {p.status === "rejected" && <span className="badge-cancelled">Rejeitado</span>}
                        </td>
                        <td className="px-4 py-4">
                          {p.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => confirmPayment(p)}
                                disabled={processing === p.id}
                                className="flex items-center gap-1 bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                {processing === p.id ? "..." : "Confirmar"}
                              </button>
                              <button
                                onClick={() => rejectPayment(p.id)}
                                disabled={processing === p.id}
                                className="flex items-center gap-1 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Rejeitar
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Businesses tab */}
        {tab === "businesses" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4">Negócio</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Plano</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Registado</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Estado</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-4">Acção</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {businesses.map((biz) => (
                    <tr key={biz.id}>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-sm">{biz.name}</p>
                        <a href={`/book/${biz.slug}`} target="_blank" className="text-teal-600 text-xs hover:underline">
                          /book/{biz.slug}
                        </a>
                      </td>
                      <td className="px-4 py-4 text-sm capitalize">{biz.plan || "—"}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {format(parseISO(biz.created_at), "d MMM yyyy", { locale: pt })}
                      </td>
                      <td className="px-4 py-4">
                        {biz.is_active
                          ? <span className="badge-confirmed">Activo</span>
                          : <span className="badge-cancelled">Inactivo</span>
                        }
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleBusiness(biz)}
                          disabled={processing === biz.id}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                            biz.is_active
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {processing === biz.id ? "..." : biz.is_active ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
