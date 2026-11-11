"use client";

export default function BookingStatusStepper({ status, paymentStatus = "UNPAID" }) {
  let actual = {
    etiqueta: "⏳ Pendiente de revisión por el Hotel",
    colorBadge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    progreso: 35,
    colorBarra: "bg-amber-400",
    mensaje:
      "Tu solicitud está en la bandeja de recepción del hotel en Ica. Puedes cancelarla sin costo mientras siga pendiente.",
  };

  if (status === "CONFIRMED" && paymentStatus === "UNPAID") {
    actual = {
      etiqueta: "💳 Cupo Confirmado • Pendiente de Pago",
      colorBadge: "bg-sky-500/20 text-sky-300 border-sky-500/40",
      progreso: 75,
      colorBarra: "bg-sky-400",
      mensaje:
        "¡El hotel confirmó disponibilidad! Registra tu pago (Yape, Plin, Tarjeta o Transferencia) para emitir tu Voucher Oficial.",
    };
  } else if (status === "CONFIRMED" && paymentStatus === "PAID") {
    actual = {
      etiqueta: "✅ Estadía Pagada y Voucher Oficial Emitido",
      colorBadge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      progreso: 100,
      colorBarra: "bg-emerald-400",
      mensaje:
        "¡Todo listo! Tu pago fue verificado y el comprobante oficial ya está compartido con la administración del hotel.",
    };
  } else if (status === "REJECTED") {
    actual = {
      etiqueta: "❌ Sin disponibilidad en estas fechas",
      colorBadge: "bg-red-500/20 text-red-300 border-red-500/40",
      progreso: 100,
      colorBarra: "bg-red-500",
      mensaje:
        "El hotel informó que no cuenta con cupos para las fechas seleccionadas. Te invitamos a elegir otro Partner verificado.",
    };
  } else if (status === "CANCELLED") {
    actual = {
      etiqueta: "🚫 Solicitud Cancelada por el Huésped",
      colorBadge: "bg-slate-700 text-slate-300 border-slate-600",
      progreso: 100,
      colorBarra: "bg-slate-500",
      mensaje: "Cancelaste esta solicitud antes de su confirmación.",
    };
  }

  return (
    <div className="mt-4 bg-slate-900/90 border border-slate-700/80 rounded-xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
          Trazabilidad en Tiempo Real (v2.0)
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

      {/* 4 Hitos del flujo transaccional */}
      <div className="grid grid-cols-4 text-[11px] text-slate-400 mb-3 gap-1">
        <span className="text-emerald-400 font-medium">1. Solicitud</span>
        <span className={status === "PENDING" ? "text-amber-300 font-bold" : "text-emerald-400"}>
          2. Revisión
        </span>
        <span
          className={
            status === "CONFIRMED"
              ? "text-sky-300 font-bold"
              : status === "REJECTED"
              ? "text-red-400 font-bold"
              : ""
          }
        >
          3. Confirmación
        </span>
        <span
          className={`text-right ${
            paymentStatus === "PAID" ? "text-emerald-400 font-bold" : ""
          }`}
        >
          4. Pago y Voucher
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">{actual.mensaje}</p>
    </div>
  );
}