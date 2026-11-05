"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { registerUser, loginUser, saveTravelPreference } from "@/services/authService";
import { fetchHotels } from "@/services/hotelService";
import HotelCard from "@/components/HotelCard";

const OPCIONES_ONBOARDING = [
  { id: "PAREJA", titulo: "💑 Escapada en Pareja", desc: "Viñedos, cenas privadas y relax" },
  { id: "AVENTURA", titulo: "🏜️ Aventura y Desierto", desc: "Huacachina, tubulares y sandboard" },
  { id: "FAMILIA", titulo: "👨‍👩‍👧‍👦 Viaje Familiar", desc: "Resorts con piscina, Paracas y seguridad" },
  { id: "NEGOCIOS", titulo: "💼 Trabajo / Negocios", desc: "Wi-Fi rápido, céntrico y tranquilo" },
];

export default function HomePage() {
  const { user, token, iniciarSesion, actualizarUsuario, cerrarSesion } = useAuth();

  // Estados de Autenticación
  const [mostrarModalAuth, setMostrarModalAuth] = useState(false);
  const [esRegistro, setEsRegistro] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "GUEST" });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [omitirOnboarding, setOmitirOnboarding] = useState(false);

  // Estados del Catálogo y Filtros Dinámicos (Fase 3)
  const [hoteles, setHoteles] = useState([]);
  const [cargandoHoteles, setCargandoHoteles] = useState(true);
  const [filtros, setFiltros] = useState({
    zone: "TODAS",
    maxPrice: 600,
    categoryTag: "TODAS",
    onlyPartners: false,
  });
  const [hotelSeleccionado, setHotelSeleccionado] = useState(null);

  // Cargar hoteles cada vez que cambie un filtro
  useEffect(() => {
    let cancelado = false;

    const cargarHoteles = async () => {
      setCargandoHoteles(true);

      try {
        const data = await fetchHotels(filtros);
        if (!cancelado) {
          setHoteles(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelado) {
          setCargandoHoteles(false);
        }
      }
    };

    cargarHoteles();

    return () => {
      cancelado = true;
    };
  }, [filtros]);

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
    // Regla de Negocio RN-01: Debe iniciar sesión para solicitar reserva
    if (!user) {
      setMostrarModalAuth(true);
      return;
    }
    setHotelSeleccionado(hotel);
  };

  // Si el usuario recién se registró y debe pasar por el Onboarding Profiling
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

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Barra de Navegación Superior */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-400">IcaStay 🏨</h1>
            <p className="text-xs text-slate-400">Alojamientos verificados con trazabilidad en Ica</p>
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-amber-300">
                  {user.role === "GUEST"
                    ? `Perfil: ${user.travelPreference || "Viajero"}`
                    : "Panel Hotel Partner"}
                </p>
              </div>
              <button
                onClick={cerrarSesion}
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
        {/* Barra de Filtros Dinámicos (RF-03) */}
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
                Precio máx. por noche: <span className="text-amber-400 font-bold">S/ {filtros.maxPrice}</span>
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

        {/* Grilla de Hoteles */}
        {cargandoHoteles ? (
          <p className="text-center text-slate-400 py-12 animate-pulse">
            Buscando alojamientos en Ica...
          </p>
        ) : hoteles.length === 0 ? (
          <div className="text-center bg-slate-800/50 border border-slate-700 rounded-xl p-10">
            <p className="text-lg font-semibold text-slate-300">
              No encontramos hoteles con esos filtros exactos.
            </p>
            <button
              onClick={() =>
                setFiltros({ zone: "TODAS", maxPrice: 600, categoryTag: "TODAS", onlyPartners: false })
              }
              className="mt-4 text-sm text-amber-400 underline"
            >
              Restablecer todos los filtros
            </button>
          </div>
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
      </main>

      {/* Modal de Confirmación Previa para Fase 4 */}
      {hotelSeleccionado && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-semibold">
              ✓ Hotel Partner Verificado
            </span>
            <h3 className="text-xl font-bold mt-3 mb-2">{hotelSeleccionado.name}</h3>
            <p className="text-sm text-slate-300 mb-4">
              En la <strong>Fase 4</strong> conectaremos este botón con el formulario de fechas y el Panel de Trazabilidad de Estados.
            </p>
            <button
              onClick={() => setHotelSeleccionado(null)}
              className="w-full bg-amber-500 text-slate-950 font-bold py-2 rounded-lg"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Modal de Login / Registro (RN-01) */}
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
                onClick={() => { setEsRegistro(false); setError(""); }}
                className={`flex-1 pb-3 font-semibold ${!esRegistro ? "text-amber-400 border-b-2 border-amber-400" : "text-slate-400"}`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => { setEsRegistro(true); setError(""); }}
                className={`flex-1 pb-3 font-semibold ${esRegistro ? "text-amber-400 border-b-2 border-amber-400" : "text-slate-400"}`}
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