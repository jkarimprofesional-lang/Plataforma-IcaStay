"use client";

export default function BookingStatusStepper({ status }) {
  const ConfiguracionEstado = {
    PENDING: {
      etiqueta: "⏳ Pendiente de revisión por el Hotel",
      colorBadge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      progreso: 50,
      colorBarra: "bg-amber-400",
      mensaje:
        "Tu solicitud ya está en la bandeja de recepción del hotel en Ica. Puedes cancelarla sin costo mientras siga pendiente.",
    },
    CONFIRMED: {
      etiqueta: "✅ Reserva Confirmada y Garantizada",
      colorBadge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      progreso: 100,
      colorBarra: "bg-emerald-400",
      mensaje:
        "¡Todo listo! El Hotel Partner ha bloqueado tu habitación y garantizado tu estadía con el Sello IcaStay.",
    },
    REJECTED: {
      etiqueta: "❌ Sin disponibilidad en estas fechas",
      colorBadge: "bg-red-500/20 text-red-300 border-red-500/40",
      progreso: 100,
      colorBarra: "bg-red-500",
      mensaje:
        "El hotel informó que no cuenta con cupos para las fechas seleccionadas. Te invitamos a elegir otro Partner verificado.",
    },
    CANCELLED: {
      etiqueta: "🚫 Solicitud Cancelada por el Huésped",
      colorBadge: "bg-slate-700 text-slate-300 border-slate-600",
      progreso: 100,
      colorBarra: "bg-slate-500",
      mensaje: "Cancelaste esta solicitud antes de su confirmación.",
    },
  };

  const actual = ConfiguracionEstado[status] || ConfiguracionEstado.PENDING;

  return (
    <div className="mt-4 bg-slate-900/90 border border-slate-700/80 rounded-xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
          Trazabilidad en Tiempo Real
        </span>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${actual.colorBadge}`}>
          {actual.etiqueta}
        </span>
      </div>

      {/* Barra de progreso visual */}
      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full transition-all duration-500 ${actual.colorBarra}`}
          style={{ width: `${actual.progreso}%` }}
        />
      </div>

      {/* Hitos del flujo */}
      <div className="flex justify-between text-[11px] text-slate-400 mb-3">
        <span className="text-emerald-400 font-medium">1. Solicitud enviada</span>
        <span className={status === "PENDING" ? "text-amber-300 font-bold" : "text-slate-300"}>
          2. Revisión del Partner
        </span>
        <span
          className={
            status === "CONFIRMED"
              ? "text-emerald-400 font-bold"
              : status === "REJECTED"
              ? "text-red-400 font-bold"
              : ""
          }
        >
          3. Resolución final
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">{actual.mensaje}</p>
    </div>
  );
}