"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Trash2, Mail, X, CheckCircle, Clock } from "lucide-react";
import { supabase, type Business, type TeamMember, getPlanLimits } from "@/lib/supabase";
import Link from "next/link";

export default function TeamPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if owner
    const { data: ownedBiz } = await supabase
      .from("businesses").select("*").eq("owner_id", user.id).single();

    if (ownedBiz) {
      setIsOwner(true);
      setBusiness(ownedBiz);
      const { data: team } = await supabase
        .from("team_members").select("*")
        .eq("business_id", ownedBiz.id).neq("status", "removed").order("invited_at");
      setMembers(team || []);
    } else {
      // Is a team member
      setIsOwner(false);
      const { data: membership } = await supabase
        .from("team_members").select("*, business:businesses(*)")
        .eq("user_id", user.id).eq("status", "active").single();

      if (membership) {
        const biz = (membership as any).business;
        setBusiness(biz);

        // Get all team members of this business
        const { data: team } = await supabase
          .from("team_members").select("*")
          .eq("business_id", biz.id).neq("status", "removed").order("invited_at");
        setMembers(team || []);

        // Get owner email
        const { data: ownerData } = await supabase.auth.admin?.getUserById?.(biz.owner_id) as any;
        if (ownerData?.user?.email) setOwnerEmail(ownerData.user.email);
      }
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const limits = getPlanLimits(business?.plan || null);
  const maxMembers = limits.members;
  const activeMembers = members.filter(m => m.status === "active").length;
  const canInvite = maxMembers === -1 || activeMembers < maxMembers;
  const isPlanBlocked = !business?.is_active;

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!business) return;
    setInviting(true); setInviteError(""); setInviteSuccess("");

    const res = await fetch("/api/invite-member", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, business_id: business.id, business_name: business.name }),
    });

    const data = await res.json();
    if (!res.ok) {
      setInviteError(data.error || "Erro ao convidar.");
    } else {
      setInviteSuccess(data.userExists
        ? "Membro adicionado com sucesso! Já tem acesso ao dashboard."
        : "Convite registado! O membro precisa de criar conta com este email."
      );
      setInviteEmail(""); load();
    }
    setInviting(false);
  }

  async function removeMember(id: string) {
    if (!confirm("Remover este membro da equipa?")) return;
    await supabase.from("team_members").update({ status: "removed" }).eq("id", id);
    setMembers(prev => prev.filter(m => m.id !== id));
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ── MEMBER VIEW ──
  if (!isOwner) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900">Equipa</h1>
          <p className="text-gray-500 text-sm mt-1">Membros do negócio <strong>{business?.name}</strong></p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 mb-6 text-sm text-purple-800">
          <p className="font-semibold mb-1">Você é membro desta equipa</p>
          <p className="text-purple-700">Tem acesso aos agendamentos e serviços. Só o proprietário pode gerir a equipa.</p>
        </div>

        {/* Owner */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
          <div className="px-6 py-4 bg-white border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Proprietário</p>
          </div>
          <div className="px-6 py-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">{business?.name}</p>
              <p className="text-gray-500 text-xs">Proprietário da conta</p>
            </div>
            <span className="bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1 rounded-full text-xs font-semibold">Proprietário</span>
          </div>
        </div>

        {/* All members */}
        {members.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-white border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Membros</p>
            </div>
            <div className="divide-y divide-gray-100">
              {members.map((member) => (
                <div key={member.id} className="px-6 py-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${member.status === "active" ? "bg-green-100" : "bg-amber-100"}`}>
                    {member.status === "active"
                      ? <CheckCircle className="w-5 h-5 text-green-600" />
                      : <Clock className="w-5 h-5 text-amber-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{member.name || member.email}</p>
                    <p className="text-gray-500 text-xs flex items-center gap-1"><Mail className="w-3 h-3" />{member.email}</p>
                  </div>
                  {member.status === "active" ? <span className="badge-confirmed">Activo</span> : <span className="badge-pending">Pendente</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── OWNER VIEW ──
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">Equipa</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {maxMembers === -1 ? "Membros ilimitados" : `${activeMembers} de ${maxMembers} membro${maxMembers > 1 ? "s" : ""} activo${maxMembers > 1 ? "s" : ""}`}
          </p>
        </div>
        {canInvite && !isPlanBlocked && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm py-2.5">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Convidar membro</span><span className="sm:hidden">Convidar</span>
          </button>
        )}
      </div>

      {isPlanBlocked && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 text-red-700 text-sm">
          A sua conta está inactiva. <Link href="/dashboard/billing" className="font-bold underline">Subscreva um plano</Link> para gerir a sua equipa.
        </div>
      )}

      {!canInvite && !isPlanBlocked && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 mb-6 text-sm text-purple-800">
          <p className="font-semibold mb-1">Limite de membros atingido</p>
          <p>O seu plano permite até {maxMembers} membro{maxMembers > 1 ? "s" : ""}. <Link href="/dashboard/billing" className="underline font-semibold">Actualize o plano</Link> para adicionar mais.</p>
        </div>
      )}

      {/* Owner card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
        <div className="px-6 py-4 bg-white border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Proprietário</p>
        </div>
        <div className="px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">{business?.name}</p>
            <p className="text-gray-500 text-xs">Proprietário da conta</p>
          </div>
          <span className="bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1 rounded-full text-xs font-semibold">Você</span>
        </div>
      </div>

      {/* Team members */}
      {members.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-white border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Membros da equipa</p>
          </div>
          <div className="divide-y divide-gray-100">
            {members.map((member) => (
              <div key={member.id} className="px-6 py-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${member.status === "active" ? "bg-green-100" : "bg-amber-100"}`}>
                  {member.status === "active" ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Clock className="w-5 h-5 text-amber-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{member.name || member.email}</p>
                  <p className="text-gray-500 text-xs flex items-center gap-1"><Mail className="w-3 h-3" />{member.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  {member.status === "active" ? <span className="badge-confirmed">Activo</span> : <span className="badge-pending">Pendente</span>}
                  <button onClick={() => removeMember(member.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {members.length === 0 && !isPlanBlocked && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm text-center py-16">
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-purple-600" />
          </div>
          <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Nenhum membro ainda</h3>
          <p className="text-gray-500 text-sm mb-6">Convide um membro para ajudar a gerir os agendamentos</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mx-auto">Convidar primeiro membro</button>
        </div>
      )}

      <div className="mt-6 bg-purple-50 border border-purple-100 rounded-2xl p-5 text-sm text-purple-800">
        <p className="font-semibold mb-1">Como funciona a equipa?</p>
        <p className="text-purple-700 leading-relaxed">Os membros podem ver e gerir agendamentos, mas não acedem a billing, definições ou equipa. Só o proprietário tem acesso total.</p>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowModal(false); setInviteError(""); setInviteSuccess(""); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-gray-900">Convidar membro</h2>
              <button onClick={() => { setShowModal(false); setInviteError(""); setInviteSuccess(""); }} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            {inviteSuccess ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-gray-900 mb-2">Convite enviado!</p>
                <p className="text-gray-500 text-sm">{inviteSuccess}</p>
                <button onClick={() => { setShowModal(false); setInviteSuccess(""); }} className="btn-primary mt-6 mx-auto">Fechar</button>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Email do membro</label>
                  <input type="email" className="input" placeholder="membro@email.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
                  <p className="text-gray-500 text-xs mt-2">Se o membro já tem conta no AgendaMoz, será adicionado imediatamente.</p>
                </div>
                {inviteError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{inviteError}</div>}
                <button type="submit" disabled={inviting} className="btn-primary w-full justify-center">{inviting ? "A convidar..." : "Enviar convite"}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
