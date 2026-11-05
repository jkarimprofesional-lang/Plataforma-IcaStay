"use client";

import Image from "next/image";

const NOMBRES_ZONA = {
  HUACACHINA: "🏜️ Oasis de Huacachina",
  PARACAS: "🌊 Bahía de Paracas",
  ICA_CENTRO: "🏙️ Ica Centro",
  VINEDOS: "🍇 Ruta de Viñedos",
  NAZCA: "🛩️ Nazca",
};

export default function HotelCard({ hotel, userPreference, onSelectPartnerHotel }) {
  const coincideConPerfil = userPreference && hotel.categoryTag === userPreference;

  return (
    <div
      className={`rounded-xl overflow-hidden border transition flex flex-col justify-between bg-slate-800 ${
        hotel.isPartner
          ? "border-amber-500/50 shadow-lg shadow-amber-500/5"
          : "border-slate-700 opacity-90"
      }`}
    >
      <div>
        {/* Imagen y Etiquetas Superiores */}
        <div className="relative h-48 w-full bg-slate-900">
          <Image
            src={hotel.imageUrl}
            alt={hotel.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
            className="object-cover"
          />
          
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {hotel.isPartner ? (
              <span className="bg-emerald-500 text-slate-950 text-xs font-bold px-2.5 py-1 rounded-full shadow">
                ✓ Sello de Garantía IcaStay
              </span>
            ) : (
              <span className="bg-slate-900/90 text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full border border-slate-600">
                Directorio Externo
              </span>
            )}

            {coincideConPerfil && (
              <span className="bg-amber-400 text-slate-950 text-xs font-bold px-2.5 py-1 rounded-full shadow">
                🔥 Ideal para tu perfil ({userPreference})
              </span>
            )}
          </div>
        </div>

        {/* Contenido de la ficha */}
        <div className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{NOMBRES_ZONA[hotel.zone] || hotel.zone}</span>
            <span className="uppercase tracking-wider text-amber-300 font-semibold">
              {hotel.categoryTag}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white mb-2">{hotel.name}</h3>
          <p className="text-sm text-slate-300 line-clamp-3 mb-4">
            {hotel.description}
          </p>
        </div>
      </div>

      {/* Pie de tarjeta: Precio y Acción condicional (RN-02) */}
      <div className="p-5 pt-0 border-t border-slate-700/60 mt-2 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 block">Precio por noche</span>
          <span className="text-xl font-bold text-amber-400">
            S/ {hotel.pricePerNight}
          </span>
        </div>

        {hotel.isPartner ? (
          <button
            onClick={() => onSelectPartnerHotel(hotel)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm px-4 py-2.5 rounded-lg transition"
          >
            Solicitar Reserva
          </button>
        ) : (
          <a
            href={hotel.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-sm px-4 py-2.5 rounded-lg transition"
          >
            Ver web externa ↗
          </a>
        )}
      </div>
    </div>
  );
}