"use client";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [estadoApi, setEstadoApi] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Hacemos la petición GET desde el puerto 3000 hacia nuestro Backend en el 4000
    fetch("http://localhost:4000/api/health")
      .then((respuesta) => respuesta.json())
      .then((datos) => setEstadoApi(datos))
      .catch((err) => setError("No se pudo conectar con el Backend"));
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-amber-400 mb-2">IcaStay 🏨</h1>
      <p className="text-slate-300 mb-8">
        Plataforma de alojamientos verificados con trazabilidad en Ica
      </p>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-lg">
        <h2 className="text-lg font-semibold mb-4 border-b border-slate-700 pb-2">
          Estado de Conexión (Fase 1)
        </h2>

        {!estadoApi && !error && (
          <p className="text-slate-400 animate-pulse">Conectando con el servidor...</p>
        )}

        {error && (
          <p className="text-red-400 font-medium">❌ {error}</p>
        )}

        {estadoApi && (
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-slate-400">Estado:</span>{" "}
              <span className="text-emerald-400 font-bold">{estadoApi.status}</span>
            </p>
            <p>
              <span className="text-slate-400">Servicio:</span> {estadoApi.proyecto}
            </p>
            <p>
              <span className="text-slate-400">Mensaje:</span> {estadoApi.mensaje}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}