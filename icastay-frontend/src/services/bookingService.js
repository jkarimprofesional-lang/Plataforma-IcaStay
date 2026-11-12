const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_URL = `${BASE_URL}/api/bookings`;

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

export const fetchMyBookings = async (token) => {
  const res = await fetch(`${API_URL}/my-bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al cargar tus reservas");
  return data;
};

export const fetchPartnerBookings = async (token) => {
  const res = await fetch(`${API_URL}/partner-bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al cargar reservas del hotel");
  return data;
};

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