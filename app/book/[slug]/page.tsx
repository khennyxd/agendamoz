"use client";
import { sendSMS, smsPendente } from "@/lib/sms";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, Clock, MapPin, Phone, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase, type Business, type Service } from "@/lib/supabase";
import { format, addDays, startOfToday, isBefore, parseISO } from "date-fns";
import { pt } from "date-fns/locale";

const TIME_SLOTS = [
  "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30","18:00",
];

type Step = "service" | "datetime" | "info" | "confirm" | "done";

export default function BookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Booking state
  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [weekStart, setWeekStart] = useState(startOfToday());
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!biz) { setNotFound(true); setLoading(false); return; }
      setBusiness(biz);

      const { data: svcs } = await supabase
        .from("services")
        .select("*")
        .eq("business_id", biz.id)
        .eq("is_active", true)
        .order("price_mzn");
      setServices(svcs || []);
      setLoading(false);
    }
    load();
  }, [slug]);

  async function loadBookedSlots(date: string) {
    if (!business) return;
    const { data } = await supabase
      .from("appointments")
      .select("time, service:services(duration_minutes)")
      .eq("business_id", business.id)
      .eq("date", date)
      .neq("status", "cancelled");

    // Calculate all blocked slots considering service duration
    const blocked = new Set<string>();
    for (const appt of (data || [])) {
      const duration = (appt as any).service?.duration_minutes || 30;
      const [h, m] = appt.time.slice(0, 5).split(":").map(Number);
      const startMins = h * 60 + m;
      // Block all 30-min slots that overlap with this appointment
      for (let i = 0; i < duration; i += 30) {
        const slotMins = startMins + i;
        const slotH = Math.floor(slotMins / 60).toString().padStart(2, "0");
        const slotM = (slotMins % 60).toString().padStart(2, "0");
        blocked.add(`${slotH}:${slotM}`);
      }
    }
    setBookedSlots(Array.from(blocked));
  }

  // Calculate blocked slots for selected service duration
  function getUnavailableSlots(bookedList: string[], serviceDuration: number): Set<string> {
    const unavailable = new Set<string>(bookedList);
    // Also block slots where the new appointment would overlap with existing ones
    for (const slot of TIME_SLOTS) {
      const [h, m] = slot.split(":").map(Number);
      const startMins = h * 60 + m;
      // Check if any slot within our service duration is already booked
      for (let i = 0; i < serviceDuration; i += 30) {
        const checkMins = startMins + i;
        const checkH = Math.floor(checkMins / 60).toString().padStart(2, "0");
        const checkM = (checkMins % 60).toString().padStart(2, "0");
        if (bookedList.includes(`${checkH}:${checkM}`)) {
          unavailable.add(slot);
          break;
        }
      }
    }
    return unavailable;
  }

  async function submitBooking() {
    if (!business || !selectedService) return;
    setSubmitting(true);

    // Check monthly limit for basic plan
    if (business.plan === "basico" || !business.plan || business.plan === "none") {
      const thisMonth = new Date().toISOString().slice(0, 7);
      const { count } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("business_id", business.id)
        .gte("date", thisMonth + "-01")
        .neq("status", "cancelled");
      if ((count || 0) >= 50) {
        setLimitReached(true);
        setSubmitting(false);
        return;
      }
    }

    const { error } = await supabase.from("appointments").insert({
      business_id: business.id,
      service_id: selectedService.id,
      client_name: clientName,
      client_phone: clientPhone,
      date: selectedDate,
      time: selectedTime,
      notes,
      status: "pending",
    });
    if (!error) {
      setStep("done");
      // Send SMS only for profissional+ plans
      const plan = business.plan || "none";
      if (plan === "profissional" || plan === "empresarial") {
        const dateFormatted = new Date(selectedDate).toLocaleDateString("pt-MZ", { day: "2-digit", month: "long" });
        sendSMS(clientPhone, smsPendente(clientName, business.name, dateFormatted, selectedTime)).catch(() => {});
      }
    }
    setSubmitting(false);
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-teal-800 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-cream flex items-center justify-center text-center px-4">
      <div>
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">Negócio não encontrado</h1>
        <p className="text-gray-500">O link de agendamento não existe ou foi alterado.</p>
      </div>
    </div>
  );

  const isInactive = !business?.is_active;
  const [limitReached, setLimitReached] = useState(false);

  if (limitReached) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center px-4">
      <div className="max-w-sm">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Calendar className="w-10 h-10 text-amber-500" />
        </div>
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-3">Agenda lotada este mês</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          <strong>{business?.name}</strong> atingiu o limite de agendamentos deste mês. Por favor tente no próximo mês ou contacte directamente o negócio.
        </p>
      </div>
    </div>
  );

  if (isInactive) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center px-4">
      <div className="max-w-sm">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Calendar className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-3">Agendamentos indisponíveis</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          De momento não é possível fazer reservas em <strong>{business?.name}</strong>.
        </p>
      </div>
    </div>
  );

  if (step === "done") return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-3">Reserva confirmada!</h1>
        <p className="text-gray-600 mb-2">
          O seu agendamento em <strong>{business?.name}</strong> foi recebido com sucesso.
        </p>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mt-6 text-left space-y-2">
          <p className="text-sm"><span className="text-gray-500">Serviço:</span> <strong>{selectedService?.name}</strong></p>
          <p className="text-sm"><span className="text-gray-500">Data:</span> <strong>{format(parseISO(selectedDate), "EEEE, d MMMM yyyy", { locale: pt })}</strong></p>
          <p className="text-sm"><span className="text-gray-500">Hora:</span> <strong>{selectedTime}</strong></p>
          <p className="text-sm"><span className="text-gray-500">Nome:</span> <strong>{clientName}</strong></p>
        </div>
        <p className="text-gray-500 text-sm mt-4">Vamos entrar em contacto para confirmar.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      {/* Business header */}
      <div className="bg-teal-800 text-white px-4 py-8">
        <div className="max-w-lg mx-auto">
          <div className="w-12 h-12 bg-teal-700 rounded-2xl flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="font-display text-2xl font-bold">{business?.name}</h1>
          {business?.description && <p className="text-teal-300 text-sm mt-1">{business.description}</p>}
          <div className="flex flex-wrap gap-4 mt-3">
            {business?.phone && (
              <span className="flex items-center gap-1.5 text-teal-300 text-sm">
                <Phone className="w-3.5 h-3.5" />{business.phone}
              </span>
            )}
            {business?.address && (
              <span className="flex items-center gap-1.5 text-teal-300 text-sm">
                <MapPin className="w-3.5 h-3.5" />{business.address}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Step progress */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2">
          {(["service","datetime","info"] as const).map((s, i) => {
            const labels = ["Serviço", "Data & Hora", "Os seus dados"];
            const steps: Step[] = ["service","datetime","info","confirm","done"];
            const current = steps.indexOf(step);
            const idx = steps.indexOf(s);
            const done = current > idx;
            const active = current === idx;
            return (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${done ? "bg-teal-800 text-white" : active ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-400"}`}>
                  {done ? "✓" : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${active ? "font-semibold text-gray-800" : "text-gray-400"}`}>{labels[i]}</span>
                {i < 2 && <div className={`flex-1 h-0.5 ${done ? "bg-teal-800" : "bg-gray-200"}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">

        {/* STEP 1: Service */}
        {step === "service" && (
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">Escolha o serviço</h2>
            {services.length === 0 ? (
              <div className="card text-center py-12 text-gray-500">
                <p>Este negócio ainda não tem serviços disponíveis.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => { setSelectedService(service); setStep("datetime"); }}
                    className={`card text-left hover:shadow-md hover:border-teal-300 transition-all border-2 ${selectedService?.id === service.id ? "border-teal-700" : "border-transparent"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{service.name}</p>
                        {service.description && <p className="text-gray-500 text-sm mt-0.5">{service.description}</p>}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3.5 h-3.5" /> {service.duration_minutes} min
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="font-display text-lg font-bold text-teal-800">{service.price_mzn.toLocaleString("pt-MZ")}</p>
                        <p className="text-xs text-gray-400">MZN</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Date & Time */}
        {step === "datetime" && (
          <div>
            <button onClick={() => setStep("service")} className="flex items-center gap-1 text-sm text-teal-700 mb-6 hover:text-teal-800">
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
            <h2 className="font-display text-2xl font-bold mb-6">Escolha a data e hora</h2>

            {/* Week navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setWeekStart(addDays(weekStart, -7))}
                disabled={isBefore(addDays(weekStart, -1), startOfToday())}
                className="p-2 hover:bg-gray-100 rounded-xl disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <p className="text-sm font-semibold">{format(weekStart, "MMMM yyyy", { locale: pt })}</p>
              <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="p-2 hover:bg-gray-100 rounded-xl">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1 mb-6">
              {weekDays.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const isPast = isBefore(day, startOfToday());
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    disabled={isPast}
                    onClick={() => { setSelectedDate(dateStr); setSelectedTime(""); loadBookedSlots(dateStr); }}
                    className={`flex flex-col items-center py-3 px-1 rounded-xl text-sm transition-all ${
                      isSelected ? "bg-teal-800 text-white" :
                      isPast ? "opacity-30 cursor-not-allowed" :
                      "hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-xs mb-1">{format(day, "EEE", { locale: pt })}</span>
                    <span className="font-bold">{format(day, "d")}</span>
                  </button>
                );
              })}
            </div>

            {/* Times */}
            {selectedDate && (
              <>
                <p className="text-sm font-semibold text-gray-700 mb-3">Horários disponíveis</p>
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {TIME_SLOTS.map((time) => {
                    const unavailable = getUnavailableSlots(bookedSlots, selectedService?.duration_minutes || 30);
                    const isUnavailable = unavailable.has(time);
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        disabled={isUnavailable}
                        onClick={() => setSelectedTime(time)}
                        title={isUnavailable ? "Horário indisponível" : ""}
                        className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isSelected ? "bg-teal-800 text-white" :
                          isUnavailable ? "bg-gray-100 text-gray-300 cursor-not-allowed line-through" :
                          "bg-white border border-gray-200 hover:border-teal-400 hover:text-teal-800"
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <button
              onClick={() => setStep("info")}
              disabled={!selectedDate || !selectedTime}
              className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
          </div>
        )}

        {/* STEP 3: Client info */}
        {step === "info" && (
          <div>
            <button onClick={() => setStep("datetime")} className="flex items-center gap-1 text-sm text-teal-700 mb-6 hover:text-teal-800">
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
            <h2 className="font-display text-2xl font-bold mb-6">Os seus dados</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Nome completo</label>
                <input className="input" placeholder="Maria da Silva" value={clientName} onChange={(e) => setClientName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Número de telefone</label>
                <input className="input" placeholder="+258 84 000 0000" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Observações (opcional)</label>
                <textarea className="input resize-none" rows={3} placeholder="Alguma informação adicional..." value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              {/* Summary */}
              <div className="bg-teal-50 rounded-2xl p-4 text-sm space-y-2">
                <p className="font-semibold text-teal-800 mb-3">Resumo da reserva</p>
                <p><span className="text-gray-500">Serviço:</span> <strong>{selectedService?.name}</strong></p>
                <p><span className="text-gray-500">Data:</span> <strong>{format(parseISO(selectedDate), "d MMMM yyyy", { locale: pt })}</strong></p>
                <p><span className="text-gray-500">Hora:</span> <strong>{selectedTime}</strong></p>
                <p><span className="text-gray-500">Preço:</span> <strong>{selectedService?.price_mzn.toLocaleString("pt-MZ")} MZN</strong></p>
              </div>

              <button
                onClick={submitBooking}
                disabled={!clientName || !clientPhone || submitting}
                className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "A confirmar..." : "Confirmar reserva"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pb-8 text-xs text-gray-400">
        Powered by <a href="/" className="text-teal-600 hover:underline">AgendaMoz</a> 🇲🇿
      </div>
    </div>
  );
}
