"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { registerUser, loginUser, saveTravelPreference } from "@/services/authService";
import { fetchHotels } from "@/services/hotelService";
import {
  createBookingRequest,
  fetchMyBookings,
  fetchPartnerBookings,
  changeBookingStatus,
} from "@/services/bookingService";
import HotelCard from "@/components/HotelCard";
import BookingStatusStepper from "@/components/BookingStatusStepper";

const OPCIONES_ONBOARDING = [
  { id: "PAREJA", titulo: "💑 Escapada en Pareja", desc: "Viñedos, cenas privadas y relax" },
  { id: "AVENTURA", titulo: "🏜️ Aventura y Desierto", desc: "Huacachina, tubulares y sandboard" },
  { id: "FAMILIA", titulo: "👨‍👩‍👧‍👦 Viaje Familiar", desc: "Resorts con piscina, Paracas y seguridad" },
  { id: "NEGOCIOS", titulo: "💼 Trabajo / Negocios", desc: "Wi-Fi rápido, céntrico y tranquilo" },
];

export default function HomePage() {
  const { user, token, iniciarSesion, actualizarUsuario, cerrarSesion } = useAuth();

  // Navegación principal: "CATALOGO" | "MIS_VIAJES" | "PANEL_PARTNER"
  const [vistaActiva, setVistaActiva] = useState("CATALOGO");

  // Estados de Autenticación
  const [mostrarModalAuth, setMostrarModalAuth] = useState(false);
  const [esRegistro, setEsRegistro] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "GUEST" });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [omitirOnboarding, setOmitirOnboarding] = useState(false);

  // Estados del Catálogo y Filtros (Fase 3)
  const [hoteles, setHoteles] = useState([]);
  const [cargandoHoteles, setCargandoHoteles] = useState(true);
  const [filtros, setFiltros] = useState({
    zone: "TODAS",
    maxPrice: 600,
    categoryTag: "TODAS",
    onlyPartners: false,
  });

  // Estados de Reserva y Trazabilidad (Fase 4)
  const [hotelSeleccionado, setHotelSeleccionado] = useState(null);
  const [reservaForm, setReservaForm] = useState({
    checkIn: "",
    checkOut: "",
    guestsCount: 2,
    notes: "",
  });
  const [errorReserva, setErrorReserva] = useState("");
  const [enviandoReserva, setEnviandoReserva] = useState(false);

  const [misReservas, setMisReservas] = useState([]);
  const [reservasPartner, setReservasPartner] = useState([]);
  const [cargandoReservas, setCargandoReservas] = useState(false);

  // Cargar catálogo de hoteles
  useEffect(() => {
    let activo = true;
    const cargarCatalogo = async () => {
      try {
        const data = await fetchHotels(filtros);
        if (activo) setHoteles(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (activo) setCargandoHoteles(false);
      }
    };
    cargarCatalogo();
    return () => {
      activo = false;
    };
  }, [filtros]);

  // Cargar reservas según la pestaña activa
  useEffect(() => {
    if (!token || !user) return;
    let activo = true;

    const cargarDatosReservas = async () => {
      setCargandoReservas(true);
      try {
        if (vistaActiva === "MIS_VIAJES" && user.role === "GUEST") {
          const data = await fetchMyBookings(token);
          if (activo) setMisReservas(data);
        } else if (vistaActiva === "PANEL_PARTNER" && user.role === "HOTEL_PARTNER") {
          const data = await fetchPartnerBookings(token);
          if (activo) setReservasPartner(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (activo) setCargandoReservas(false);
      }
    };

    cargarDatosReservas();
    return () => {
      activo = false;
    };
  }, [vistaActiva, token, user]);

  const handleSubmitAuth = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const respuesta = esRegistro
        ? await registerUser(formData)
        : await loginUser({ email: formData.email, password: formData.password });
      iniciarSesion(respuesta.user, respuesta.token);
      setMostrarModalAuth(false);
      // Si inicia sesión un Hotel Partner, lo llevamos directo a su panel de recepción
      if (respuesta.user.role === "HOTEL_PARTNER") {
        setVistaActiva("PANEL_PARTNER");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleSeleccionarPreferencia = async (preferencia) => {
    setCargando(true);
    try {
      const res = await saveTravelPreference(preferencia, token);
      actualizarUsuario(res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleIntentarReservar = (hotel) => {
    if (!user) {
      setMostrarModalAuth(true);
      return;
    }
    setErrorReserva("");
    setReservaForm({ checkIn: "", checkOut: "", guestsCount: 2, notes: "" });
    setHotelSeleccionado(hotel);
  };

  // Cálculo preliminar de noches para mostrar en el modal
  const calcularNochesPreliminar = () => {
    if (!reservaForm.checkIn || !reservaForm.checkOut) return 0;
    const inicio = new Date(reservaForm.checkIn);
    const fin = new Date(reservaForm.checkOut);
    const diff = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const handleCrearReserva = async (e) => {
    e.preventDefault();
    setErrorReserva("");
    setEnviandoReserva(true);
    try {
      await createBookingRequest(
        {
          hotelId: hotelSeleccionado.id,
          ...reservaForm,
        },
        token
      );
      setHotelSeleccionado(null);
      setVistaActiva("MIS_VIAJES");
    } catch (err) {
      setErrorReserva(err.message);
    } finally {
      setEnviandoReserva(false);
    }
  };

  const handleCambiarEstado = async (bookingId, nuevoEstado) => {
    try {
      await changeBookingStatus(bookingId, nuevoEstado, token);
      if (user.role === "GUEST") {
        const actualizadas = await fetchMyBookings(token);
        setMisReservas(actualizadas);
      } else {
        const actualizadas = await fetchPartnerBookings(token);
        setReservasPartner(actualizadas);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Onboarding Profiling para nuevos huéspedes
  if (user && user.role === "GUEST" && !user.travelPreference && !omitirOnboarding) {
    return (
      <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-lg w-full shadow-lg">
          <span className="text-xs uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full">
            Experiencia Personalizada
          </span>
          <h2 className="text-2xl font-bold mt-3 mb-1">¡Bienvenido a IcaStay, {user.name}!</h2>
          <p className="text-slate-400 text-sm mb-6">
            ¿Cuál es el motivo principal de tu viaje a Ica? Destacaremos los alojamientos ideales para ti.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {OPCIONES_ONBOARDING.map((item) => (
              <button
                key={item.id}
                disabled={cargando}
                onClick={() => handleSeleccionarPreferencia(item.id)}
                className="text-left p-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 transition"
              >
                <p className="font-semibold text-white mb-1">{item.titulo}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </button>
            ))}
          </div>
          <button
            onClick={() => setOmitirOnboarding(true)}
            className="w-full text-center text-xs text-slate-400 hover:text-white underline"
          >
            Omitir por ahora e ir al catálogo
          </button>
        </div>
      </main>
    );
  }

  const nochesCalculadas = calcularNochesPreliminar();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Cabecera con Navegación por Rol */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <button onClick={() => setVistaActiva("CATALOGO")} className="text-left">
              <h1 className="text-2xl font-bold text-amber-400">IcaStay 🏨</h1>
              <p className="text-xs text-slate-400">Trazabilidad y Garantía en Ica</p>
            </button>

            {/* Pestañas de navegación */}
            <nav className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setVistaActiva("CATALOGO")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition ${
                  vistaActiva === "CATALOGO"
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                🔍 Catálogo
              </button>

              {user?.role === "GUEST" && (
                <button
                  onClick={() => setVistaActiva("MIS_VIAJES")}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition ${
                    vistaActiva === "MIS_VIAJES"
                      ? "bg-amber-500 text-slate-950"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  🧳 Mis Viajes (Trazabilidad)
                </button>
              )}

              {user?.role === "HOTEL_PARTNER" && (
                <button
                  onClick={() => setVistaActiva("PANEL_PARTNER")}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition ${
                    vistaActiva === "PANEL_PARTNER"
                      ? "bg-emerald-500 text-slate-950"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  🛎️ Recepción Partner
                </button>
              )}
            </nav>
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-amber-300">
                  {user.role === "GUEST"
                    ? `Viajero (${user.travelPreference || "General"})`
                    : "Socio Hotelero Verificado"}
                </p>
              </div>
              <button
                onClick={() => {
                  cerrarSesion();
                  setVistaActiva("CATALOGO");
                }}
                className="bg-slate-800 hover:bg-red-600 text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-700 transition"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <button
              onClick={() => setMostrarModalAuth(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm px-4 py-2 rounded-lg transition"
            >
              Iniciar Sesión / Registro
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* VISTA A: CATÁLOGO DE HOTELES */}
        {vistaActiva === "CATALOGO" && (
          <>
            <section className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-8 shadow-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Zona en Ica</label>
                  <select
                    value={filtros.zone}
                    onChange={(e) => setFiltros({ ...filtros, zone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="TODAS">📍 Todas las zonas</option>
                    <option value="HUACACHINA">🏜️ Oasis de Huacachina</option>
                    <option value="PARACAS">🌊 Bahía de Paracas</option>
                    <option value="VINEDOS">🍇 Ruta de Viñedos</option>
                    <option value="ICA_CENTRO">🏙️ Ica Centro</option>
                    <option value="NAZCA">🛩️ Nazca</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Estilo de Viaje</label>
                  <select
                    value={filtros.categoryTag}
                    onChange={(e) => setFiltros({ ...filtros, categoryTag: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="TODAS">✨ Todos los estilos</option>
                    <option value="AVENTURA">🏜️ Aventura</option>
                    <option value="PAREJA">💑 Pareja / Romántico</option>
                    <option value="FAMILIA">👨‍👩‍👧‍👦 Familia</option>
                    <option value="NEGOCIOS">💼 Negocios</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Precio máx. por noche:{" "}
                    <span className="text-amber-400 font-bold">S/ {filtros.maxPrice}</span>
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="600"
                    step="20"
                    value={filtros.maxPrice}
                    onChange={(e) => setFiltros({ ...filtros, maxPrice: e.target.value })}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center h-full pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={filtros.onlyPartners}
                      onChange={(e) => setFiltros({ ...filtros, onlyPartners: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <span>Solo Verificados (Sello IcaStay)</span>
                  </label>
                </div>
              </div>
            </section>

            {cargandoHoteles ? (
              <p className="text-center text-slate-400 py-12 animate-pulse">
                Buscando alojamientos en Ica...
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hoteles.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    userPreference={user?.travelPreference}
                    onSelectPartnerHotel={handleIntentarReservar}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* VISTA B: MIS VIAJES Y TRAZABILIDAD (HUÉSPED) */}
        {vistaActiva === "MIS_VIAJES" && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Mis Solicitudes de Reserva</h2>
                <p className="text-sm text-slate-400">
                  Sigue en tiempo real la confirmación de tus alojamientos verificados en Ica
                </p>
              </div>
              <button
                onClick={() => fetchMyBookings(token).then(setMisReservas)}
                className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-lg"
              >
                ↻ Actualizar estados
              </button>
            </div>

            {cargandoReservas ? (
              <p className="text-slate-400 py-8 text-center">Cargando tus reservas...</p>
            ) : misReservas.length === 0 ? (
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-10 text-center">
                <p className="text-slate-300 mb-4">
                  Aún no has enviado solicitudes de reserva a nuestros Hoteles Partner.
                </p>
                <button
                  onClick={() => setVistaActiva("CATALOGO")}
                  className="bg-amber-500 text-slate-950 font-bold text-sm px-5 py-2.5 rounded-lg"
                >
                  Explorar Hoteles en Ica
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {misReservas.map((reserva) => (
                  <div
                    key={reserva.id}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <span className="text-xs text-emerald-400 font-semibold">
                          Reserva #{reserva.id} • {reserva.hotel?.zone}
                        </span>
                        <h3 className="text-xl font-bold text-white mt-0.5">
                          {reserva.hotel?.name}
                        </h3>
                        <p className="text-xs text-slate-300 mt-1">
                          📅 Ingreso:{" "}
                          <strong>{new Date(reserva.checkIn).toLocaleDateString()}</strong> ➔
                          Salida: <strong>{new Date(reserva.checkOut).toLocaleDateString()}</strong>{" "}
                          ({reserva.nights} {reserva.nights === 1 ? "noche" : "noches"} •{" "}
                          {reserva.guestsCount} huéspedes)
                        </p>
                        {reserva.notes && (
                          <p className="text-xs text-slate-400 mt-1 italic">
                            Nota enviada: &quot;{reserva.notes}&quot;
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Total estimado</span>
                        <span className="text-2xl font-bold text-amber-400">
                          S/ {reserva.totalPrice}
                        </span>
                      </div>
                    </div>

                    {/* Componente de Barra de Trazabilidad */}
                    <BookingStatusStepper status={reserva.status} />

                    {/* Regla de Negocio RN-04: Cancelar solo si está en PENDING */}
                    {reserva.status === "PENDING" && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleCambiarEstado(reserva.id, "CANCELLED")}
                          className="text-xs bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-700/60 px-4 py-2 rounded-lg transition"
                        >
                          Cancelar Solicitud (Permitido en estado Pendiente)
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* VISTA C: PANEL DE RECEPCIÓN DEL HOTEL PARTNER */}
        {vistaActiva === "PANEL_PARTNER" && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-semibold">
                  Gestión Hotelera
                </span>
                <h2 className="text-2xl font-bold text-white mt-2">
                  Bandeja de Solicitudes Recibidas
                </h2>
                <p className="text-sm text-slate-400">
                  Confirma o rechaza las solicitudes de los viajeros para actualizar su barra de trazabilidad.
                </p>
              </div>
            </div>

            {cargandoReservas ? (
              <p className="text-slate-400 py-8 text-center">Cargando bandeja de recepción...</p>
            ) : reservasPartner.length === 0 ? (
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-10 text-center text-slate-300">
                Aún no hay solicitudes de reserva registradas para tus hoteles.
              </div>
            ) : (
              <div className="space-y-4">
                {reservasPartner.map((reserva) => (
                  <div
                    key={reserva.id}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-slate-900 px-2.5 py-1 rounded text-amber-400">
                          #{reserva.id}
                        </span>
                        <h3 className="font-bold text-lg text-white">{reserva.hotel?.name}</h3>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-200">
                          Estado actual: {reserva.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">
                        👤 Huésped: <strong>{reserva.user?.name}</strong> ({reserva.user?.email}) •
                        Perfil:{" "}
                        <span className="text-amber-300">
                          {reserva.user?.travelPreference || "No especificado"}
                        </span>
                      </p>
                      <p className="text-xs text-slate-400">
                        📅 Del {new Date(reserva.checkIn).toLocaleDateString()} al{" "}
                        {new Date(reserva.checkOut).toLocaleDateString()} ({reserva.nights} noches,{" "}
                        {reserva.guestsCount} personas) •{" "}
                        <strong className="text-emerald-400">Total: S/ {reserva.totalPrice}</strong>
                      </p>
                      {reserva.notes && (
                        <p className="text-xs text-amber-200/90 bg-slate-900/80 p-2 rounded mt-1">
                          💬 Pedido especial: &quot;{reserva.notes}&quot;
                        </p>
                      )}
                    </div>

                    {reserva.status === "PENDING" ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleCambiarEstado(reserva.id, "CONFIRMED")}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-lg transition"
                        >
                          ✓ Confirmar Cupo
                        </button>
                        <button
                          onClick={() => handleCambiarEstado(reserva.id, "REJECTED")}
                          className="bg-red-600/80 hover:bg-red-600 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition"
                        >
                          ✕ Rechazar
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Solicitud gestionada ({reserva.status})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* MODAL PARA SOLICITAR RESERVA EN HOTEL PARTNER (FASE 4) */}
      {hotelSeleccionado && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full relative shadow-2xl">
            <button
              onClick={() => setHotelSeleccionado(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-semibold">
              ✓ Reserva con Sello de Garantía IcaStay
            </span>
            <h3 className="text-xl font-bold mt-3">{hotelSeleccionado.name}</h3>
            <p className="text-xs text-slate-400 mb-4">
              Tarifa verificada: S/ {hotelSeleccionado.pricePerNight} por noche
            </p>

            {errorReserva && (
              <div className="bg-red-900/40 border border-red-500 text-red-200 text-xs p-3 rounded-lg mb-4">
                ❌ {errorReserva}
              </div>
            )}

            <form onSubmit={handleCrearReserva} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Fecha de Check-in</label>
                  <input
                    type="date"
                    required
                    value={reservaForm.checkIn}
                    onChange={(e) => setReservaForm({ ...reservaForm, checkIn: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Fecha de Check-out</label>
                  <input
                    type="date"
                    required
                    value={reservaForm.checkOut}
                    onChange={(e) => setReservaForm({ ...reservaForm, checkOut: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Número de huéspedes</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={reservaForm.guestsCount}
                  onChange={(e) => setReservaForm({ ...reservaForm, guestsCount: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Comentarios para recepción (Opcional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Ej. Llegaremos a las 3:00 PM, deseamos vista a la laguna..."
                  value={reservaForm.notes}
                  onChange={(e) => setReservaForm({ ...reservaForm, notes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              {nochesCalculadas > 0 && (
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center justify-between text-sm">
                  <span className="text-slate-300">
                    Total por {nochesCalculadas} {nochesCalculadas === 1 ? "noche" : "noches"}:
                  </span>
                  <span className="text-lg font-bold text-amber-400">
                    S/ {nochesCalculadas * hotelSeleccionado.pricePerNight}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={enviandoReserva}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-lg transition"
              >
                {enviandoReserva ? "Enviando solicitud..." : "Confirmar Solicitud de Reserva"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE LOGIN / REGISTRO */}
      {mostrarModalAuth && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full relative">
            <button
              onClick={() => setMostrarModalAuth(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <div className="flex border-b border-slate-700 mb-6">
              <button
                onClick={() => {
                  setEsRegistro(false);
                  setError("");
                }}
                className={`flex-1 pb-3 font-semibold ${
                  !esRegistro ? "text-amber-400 border-b-2 border-amber-400" : "text-slate-400"
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => {
                  setEsRegistro(true);
                  setError("");
                }}
                className={`flex-1 pb-3 font-semibold ${
                  esRegistro ? "text-amber-400 border-b-2 border-amber-400" : "text-slate-400"
                }`}
              >
                Registrarse
              </button>
            </div>
            {error && (
              <div className="bg-red-900/40 border border-red-500 text-red-200 text-sm p-3 rounded-lg mb-4">
                ❌ {error}
              </div>
            )}
            <form onSubmit={handleSubmitAuth} className="space-y-4">
              {esRegistro && (
                <>
                  <input
                    type="text"
                    required
                    placeholder="Nombre completo o del Hotel"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="GUEST">🧳 Soy Viajero / Huésped</option>
                    <option value="HOTEL_PARTNER">🏨 Soy un Hotel en Ica (Partner)</option>
                  </select>
                </>
              )}
              <input
                type="email"
                required
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
              <input
                type="password"
                required
                placeholder="Contraseña"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-lg transition"
              >
                {cargando ? "Procesando..." : esRegistro ? "Crear cuenta" : "Entrar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}