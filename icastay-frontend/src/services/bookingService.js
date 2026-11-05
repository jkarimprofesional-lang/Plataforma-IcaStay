const API_URL = "http://localhost:4000/api/bookings";

// 1. Enviar nueva solicitud de reserva (Huésped)
export const createBookingRequest = async (datosReserva, token) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datosReserva),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al crear la reserva");
  return data;
};

// 2. Obtener el historial y estado de reservas del Huésped ("Mis Viajes")
export const fetchMyBookings = async (token) => {
  const res = await fetch(`${API_URL}/my-bookings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al cargar tus reservas");
  return data;
};

// 3. Obtener las solicitudes entrantes para el Hotel Partner ("Panel de Recepción")
export const fetchPartnerBookings = async (token) => {
  const res = await fetch(`${API_URL}/partner-bookings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al cargar reservas del hotel");
  return data;
};

// 4. Cambiar estado de reserva (Cancelar por Huésped o Confirmar/Rechazar por Hotel)
export const changeBookingStatus = async (bookingId, status, token) => {
  const res = await fetch(`${API_URL}/${bookingId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "No se pudo actualizar el estado");
  return data;
};