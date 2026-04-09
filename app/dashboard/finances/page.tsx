"use client";

import { useState } from "react";
import { DollarSign, Plus, CreditCard, Smartphone, Building2, X, CheckCircle } from "lucide-react";

const paymentMethods = [
  { id: "mpesa",    name: "M-Pesa",         icon: Smartphone, desc: "Vodacom Moçambique",     color: "bg-red-50 text-red-600 border-red-100" },
  { id: "emola",    name: "e-Mola",          icon: Smartphone, desc: "Movitel Moçambique",     color: "bg-orange-50 text-orange-600 border-orange-100" },
  { id: "mkesh",    name: "mKesh",           icon: Smartphone, desc: "TMcel Moçambique",       color: "bg-blue-50 text-blue-600 border-blue-100" },
  { id: "bank",     name: "Transferência",   icon: Building2,  desc: "Transferência bancária", color: "bg-green-50 text-green-600 border-green-100" },
  { id: "card",     name: "Cartão",          icon: CreditCard, desc: "Visa / Mastercard",      color: "bg-purple-50 text-purple-600 border-purple-100" },
];

export default function FinancesPage() {
  const [registered, setRegistered] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState("");
  const [details, setDetails] = useState({ number: "", name: "", iban: "" });
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setRegistered(prev => [...prev.filter(r => r !== selected), selected]);
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowModal(false); setSelected(""); setDetails({ number: "", name: "", iban: "" }); }, 1500);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-2xl font-bold text-gray-900">Finanças</h1>
            <span className="text-xs font-bold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">Beta</span>
          </div>
          <p className="text-gray-500 text-sm">Ligue as contas do seu negócio e acompanhe tudo num só lugar</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm py-2.5">
          <Plus className="w-4 h-4" /> Adicionar método
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 mb-6 text-sm text-purple-900">
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0">🔗</span>
          <div>
            <p className="font-bold text-purple-800 mb-1">Em breve: ligação às suas contas</p>
            <p className="text-purple-700 leading-relaxed mb-3">
              Esta secção vai permitir ligar as contas do seu negócio — M-Pesa, e-Mola, mKesh, transferência bancária — directamente ao AgendaMoz. Cada transacção ficará registada no sistema de forma automática e em tempo real.
            </p>
            <div className="flex flex-col gap-1.5 text-purple-700">
              <p className="flex items-start gap-2"><span className="text-green-600 font-bold flex-shrink-0">✓</span> O AgendaMoz só terá acesso de <strong>leitura</strong> — nunca poderá fazer transferências, movimentar ou tocar no seu dinheiro.</p>
              <p className="flex items-start gap-2"><span className="text-green-600 font-bold flex-shrink-0">✓</span> Os seus dados são <strong>protegidos e nunca partilhados</strong> com terceiros.</p>
              <p className="flex items-start gap-2"><span className="text-blue-500 font-bold flex-shrink-0">ℹ</span> Esta funcionalidade é <strong>completamente opcional</strong> — pode continuar a usar o AgendaMoz sem a activar.</p>
            </div>
          </div>
        </div>
      </div>

      {registered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm text-center py-16 px-8">
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-7 h-7 text-purple-600" />
          </div>
          <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Nenhum método registado</h3>
          <p className="text-gray-500 text-sm mb-6">Adicione os métodos de pagamento que aceita no seu negócio</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mx-auto">Adicionar primeiro método</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paymentMethods.filter(m => registered.includes(m.id)).map(({ id, name, icon: Icon, desc, color }) => (
            <div key={id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{name}</p>
                <p className="text-gray-400 text-xs">{desc}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-gray-900">Adicionar método de pagamento</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {saved ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-gray-900">Método adicionado!</p>
              </div>
            ) : (
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Método de pagamento</label>
                  <div className="grid grid-cols-1 gap-2">
                    {paymentMethods.map(({ id, name, icon: Icon, desc, color }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSelected(id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                          selected === id ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-200"
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{name}</p>
                          <p className="text-gray-400 text-xs">{desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {selected && (
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      {selected === "bank" ? "IBAN / NIB" : selected === "card" ? "Nome no cartão" : "Número"}
                    </label>
                    <input
                      className="input"
                      placeholder={selected === "mpesa" || selected === "emola" || selected === "mkesh" ? "+258 84 000 0000" : selected === "bank" ? "00000000000000000" : "Nome completo"}
                      value={selected === "bank" ? details.iban : selected === "card" ? details.name : details.number}
                      onChange={(e) => {
                        if (selected === "bank") setDetails(p => ({ ...p, iban: e.target.value }));
                        else if (selected === "card") setDetails(p => ({ ...p, name: e.target.value }));
                        else setDetails(p => ({ ...p, number: e.target.value }));
                      }}
                    />
                  </div>
                )}

                <button type="submit" disabled={!selected} className="btn-primary w-full justify-center mt-2 disabled:opacity-50">
                  Guardar método
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
