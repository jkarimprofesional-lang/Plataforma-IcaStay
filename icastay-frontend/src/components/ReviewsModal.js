"use client";
import { useState, useEffect } from "react";
import {
  fetchHotelReviews,
  postHotelReview,
  manageReviewPartner,
} from "@/services/reviewService";

export default function ReviewsModal({ hotel, user, token, onClose, onReviewAdded }) {
  const [datos, setDatos] = useState({
    total: 0,
    avgRating: 0,
    conteoEstrellas: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    reviews: [],
  });
  const [cargando, setCargando] = useState(true);
  const [filtroActivo, setFiltroActivo] = useState("TODAS"); // "TODAS" | "POSITIVAS" | "CRITICAS" | 5 | 4 | 3 | 2 | 1

  // Formulario de nueva reseña
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorForm, setErrorForm] = useState("");

  // Estado para respuesta del Partner
  const [respondiendoId, setRespondiendoId] = useState(null);
  const [textoRespuesta, setTextoRespuesta] = useState("");

  const esPropietarioPartner =
    user && (user.role === "ADMIN" || (user.role === "HOTEL_PARTNER" && hotel?.ownerId === user.id));

  const cargarResenas = async () => {
    if (!hotel) return;
    setCargando(true);
    try {
      const data = await fetchHotelReviews(hotel.id);
      setDatos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!hotel) return;

    let activo = true;
    fetchHotelReviews(hotel.id)
      .then((data) => {
        if (activo) setDatos(data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [hotel]);

  if (!hotel) return null;

  const handlePublicar = async (e) => {
    e.preventDefault();
    setErrorForm("");
    setEnviando(true);
    try {
      await postHotelReview(hotel.id, { rating, comment }, token);
      setComment("");
      setRating(5);
      await cargarResenas();
      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const handleToggleDestacada = async (review) => {
    try {
      await manageReviewPartner(review.id, { isFeatured: !review.isFeatured }, token);
      await cargarResenas();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGuardarRespuesta = async (reviewId) => {
    try {
      await manageReviewPartner(reviewId, { partnerReply: textoRespuesta }, token);
      setRespondiendoId(null);
      setTextoRespuesta("");
      await cargarResenas();
    } catch (err) {
      alert(err.message);
    }
  };

  // Aplicar filtro seleccionado por el usuario o administrador del hotel
  const reviewsFiltradas = datos.reviews.filter((r) => {
    if (filtroActivo === "TODAS") return true;
    if (filtroActivo === "POSITIVAS") return r.rating >= 4;
    if (filtroActivo === "CRITICAS") return r.rating <= 2;
    return r.rating === Number(filtroActivo);
  });

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-3xl w-full relative shadow-2xl text-white my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg"
        >
          ✕
        </button>

        <span className="text-xs uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-semibold">
          Reputación y Reseñas Verificadas
        </span>
        <h3 className="text-2xl font-bold text-white mt-2">{hotel.name}</h3>
        <p className="text-xs text-slate-400 mb-5">
          Las reseñas de viajeros con reserva pagada llevan automáticamente el sello de Estadía Verificada.
        </p>

        {/* Panel de Estadísticas por Estrella (1★ a 5★) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-800/80 border border-slate-700 rounded-xl p-4 mb-5">
          <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-700 pb-3 md:pb-0">
            <span className="text-4xl font-extrabold text-amber-400">
              {datos.avgRating > 0 ? `★ ${datos.avgRating}` : "Sin votos"}
            </span>
            <span className="text-xs text-slate-400 mt-1">
              Basado en {datos.total} {datos.total === 1 ? "reseña" : "reseñas"}
            </span>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            {[5, 4, 3, 2, 1].map((estrella) => {
              const cantidad = datos.conteoEstrellas[estrella] || 0;
              const porcentaje = datos.total > 0 ? Math.round((cantidad / datos.total) * 100) : 0;
              return (
                <button
                  key={estrella}
                  onClick={() => setFiltroActivo(estrella)}
                  className="w-full flex items-center gap-3 text-xs hover:bg-slate-700/40 px-2 py-0.5 rounded transition"
                >
                  <span className="w-12 text-left font-bold text-amber-300">{estrella} ★</span>
                  <div className="flex-1 bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full transition-all"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-slate-300">
                    {cantidad} ({porcentaje}%)
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Barra de Filtros Rápidos (Buenos, Malos, por Estrella) */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {[
            { id: "TODAS", label: `Todas (${datos.total})` },
            { id: "POSITIVAS", label: "👍 Positivas (4★-5★)" },
            { id: "CRITICAS", label: "⚠️ Críticas (1★-2★)" },
            { id: 5, label: "5 ★" },
            { id: 4, label: "4 ★" },
            { id: 3, label: "3 ★" },
            { id: 2, label: "2 ★" },
            { id: 1, label: "1 ★" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltroActivo(f.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                filtroActivo === f.id
                  ? "bg-amber-500 text-slate-950 border-amber-400"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Formulario para dejar una reseña (Usuarios autenticados) */}
        {user ? (
          <form
            onSubmit={handlePublicar}
            className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-6 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-200">
                Publicar opinión como {user.name}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400 mr-2">Calificación:</span>
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setRating(num)}
                    className={`text-lg transition ${
                      num <= rating ? "text-amber-400 scale-110" : "text-slate-600"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {errorForm && (
              <p className="text-xs text-red-300 bg-red-950/50 p-2 rounded border border-red-700">
                ❌ {errorForm}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                required
                placeholder="Comparte tu experiencia sobre las instalaciones, atención o ubicación..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              />
              <button
                type="submit"
                disabled={enviando}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg shrink-0 transition"
              >
                {enviando ? "Publicando..." : "Enviar Reseña"}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-xs text-slate-400 bg-slate-800/50 border border-slate-700 rounded-lg p-3 mb-5 text-center">
            Inicia sesión para calificar y compartir tu experiencia en este alojamiento.
          </p>
        )}

        {/* Listado de Reseñas */}
        {cargando ? (
          <p className="text-center text-slate-400 py-6 text-sm">Cargando opiniones...</p>
        ) : reviewsFiltradas.length === 0 ? (
          <p className="text-center text-slate-400 py-8 text-sm bg-slate-800/40 rounded-xl border border-slate-800">
            No hay reseñas que coincidan con el filtro seleccionado.
          </p>
        ) : (
          <div className="space-y-4">
            {reviewsFiltradas.map((rev) => (
              <div
                key={rev.id}
                className={`rounded-xl p-4 border transition ${
                  rev.isFeatured
                    ? "bg-amber-500/10 border-amber-500/50"
                    : "bg-slate-800 border-slate-700"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-white">{rev.user?.name}</span>

                    {/* Insignia Antifraude RN-07 */}
                    {rev.isVerifiedStay && (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        ✓ Huésped con Estadía Verificada
                      </span>
                    )}

                    {/* Insignia Comercial de Reseña Destacada por el Hotel */}
                    {rev.isFeatured && (
                      <span className="bg-amber-400 text-slate-950 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                        ⭐ Destacada por el Hotel
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold text-sm">
                      {"★".repeat(rev.rating)}
                      <span className="text-slate-600">{"★".repeat(5 - rev.rating)}</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed">{rev.comment}</p>

                {/* Respuesta Oficial de la Administración del Hotel */}
                {rev.partnerReply && (
                  <div className="mt-3 bg-slate-900/90 border-l-4 border-emerald-500 p-3 rounded-r-lg text-xs">
                    <span className="font-bold text-emerald-400 block mb-1">
                      🏨 Respuesta Oficial de la Administración ({hotel.name}):
                    </span>
                    <p className="text-slate-300">{rev.partnerReply}</p>
                  </div>
                )}

                {/* Controles Comerciales exclusivos para el Hotel Partner dueño */}
                {esPropietarioPartner && (
                  <div className="mt-3 pt-3 border-t border-slate-700/70 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleDestacada(rev)}
                        className={`text-[11px] font-bold px-3 py-1 rounded-md transition ${
                          rev.isFeatured
                            ? "bg-slate-700 text-slate-200"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                        }`}
                      >
                        {rev.isFeatured ? "Quitar de destacadas" : "⭐ Fijar como Destacada"}
                      </button>

                      <button
                        onClick={() => {
                          setRespondiendoId(respondiendoId === rev.id ? null : rev.id);
                          setTextoRespuesta(rev.partnerReply || "");
                        }}
                        className="text-[11px] bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-3 py-1 rounded-md transition"
                      >
                        💬 {rev.partnerReply ? "Editar Respuesta Oficial" : "Responder al Huésped"}
                      </button>
                    </div>
                  </div>
                )}

                {respondiendoId === rev.id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Escribe la respuesta oficial de la administración del hotel..."
                      value={textoRespuesta}
                      onChange={(e) => setTextoRespuesta(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <button
                      onClick={() => handleGuardarRespuesta(rev.id)}
                      className="bg-emerald-500 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg"
                    >
                      Guardar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}