"use client";

const NOMBRES_METODO = {
  YAPE: "📱 Yape (Billetera Digital)",
  PLIN: "📱 Plin (Transferencia Interbancaria)",
  CARD: "💳 Tarjeta de Crédito / Débito",
  TRANSFER: "🏦 Transferencia Bancaria Directa",
};

export default function VoucherModal({ reserva, onClose }) {
  if (!reserva) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-2xl p-6 max-w-lg w-full relative shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg"
        >
          ✕
        </button>

        {/* Encabezado Oficial del Comprobante */}
        <div className="border-b border-slate-700 pb-4 mb-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-widest bg-emerald-500 text-slate-950 font-extrabold px-2.5 py-0.5 rounded-full">
              ✓ Comprobante Oficial Verificado
            </span>
            <h3 className="text-2xl font-bold text-amber-400 mt-2">IcaStay 🏨</h3>
            <p className="text-xs text-slate-400">
              Documento compartido entre Huésped y Administración Hotelera
            </p>
          </div>
          <div className="text-right bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Código Voucher</span>
            <span className="text-sm font-mono font-bold text-emerald-400">
              {reserva.voucherCode}
            </span>
          </div>
        </div>

        {/* Detalles del Alojamiento y Huésped */}
        <div className="space-y-3 text-sm bg-slate-800/70 border border-slate-700 rounded-xl p-4 mb-4">
          <div className="flex justify-between border-b border-slate-700/70 pb-2">
            <span className="text-slate-400">Alojamiento Verificado:</span>
            <span className="font-bold text-white">{reserva.hotel?.name}</span>
          </div>
          <div className="flex justify-between border-b border-slate-700/70 pb-2">
            <span className="text-slate-400">Ubicación en Ica:</span>
            <span className="text-amber-300 font-semibold">{reserva.hotel?.zone}</span>
          </div>
          <div className="flex justify-between border-b border-slate-700/70 pb-2">
            <span className="text-slate-400">Huésped Titular:</span>
            <span className="font-semibold text-white">
              {reserva.user?.name || "Titular Verificado"} ({reserva.user?.email})
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-700/70 pb-2">
            <span className="text-slate-400">Check-in ➔ Check-out:</span>
            <span className="font-semibold text-white">
              {new Date(reserva.checkIn).toLocaleDateString()} ➔{" "}
              {new Date(reserva.checkOut).toLocaleDateString()} ({reserva.nights} noches)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Capacidad reservada:</span>
            <span className="text-white">{reserva.guestsCount} huéspedes</span>
          </div>
        </div>

        {/* Detalles de la Comprobación de Pago */}
        <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 mb-5 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-300">Estado Financiero:</span>
            <span className="font-bold text-emerald-400">PAGADO Y GARANTIZADO (PAID)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Método de Pago:</span>
            <span className="font-semibold text-white">
              {NOMBRES_METODO[reserva.paymentMethod] || reserva.paymentMethod}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Referencia / N° de Operación:</span>
            <span className="font-mono font-bold text-amber-300">{reserva.paymentReference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Fecha de Comprobación:</span>
            <span className="text-slate-200">
              {reserva.paidAt ? new Date(reserva.paidAt).toLocaleString() : "Registrado"}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-emerald-500/30 text-sm">
            <span className="font-bold text-white">Monto Total Cancelado:</span>
            <span className="text-lg font-extrabold text-amber-400">S/ {reserva.totalPrice}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition"
          >
            🖨️ Imprimir / Guardar PDF
          </button>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-2.5 rounded-lg text-sm border border-slate-700 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}