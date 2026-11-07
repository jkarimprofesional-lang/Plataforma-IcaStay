const API_URL = "http://localhost:4000/api/hotels";

export const fetchHotels = async (filtros = {}) => {
  const params = new URLSearchParams();

  if (filtros.zone && filtros.zone !== "TODAS") params.append("zone", filtros.zone);
  if (filtros.maxPrice) params.append("maxPrice", filtros.maxPrice);
  if (filtros.categoryTag && filtros.categoryTag !== "TODAS") params.append("categoryTag", filtros.categoryTag);
  if (filtros.onlyPartners) params.append("onlyPartners", "true");

  const queryString = params.toString();
  const url = queryString ? `${API_URL}?${queryString}` : API_URL;

  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al cargar hoteles");
  return data;
};

// Obtener los hoteles propios del Partner autenticado (RF-06)
export const fetchMyPartnerHotels = async (token) => {
  const res = await fetch(`${API_URL}/my-hotels`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al cargar tus alojamientos");
  return data;
};

// Crear nuevo hotel Partner (RF-06)
export const createHotel = async (hotelData, token) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(hotelData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al registrar alojamiento");
  return data;
};

// Editar hotel existente del Partner (RF-06)
export const updateHotel = async (hotelId, hotelData, token) => {
  const res = await fetch(`${API_URL}/${hotelId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(hotelData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al actualizar alojamiento");
  return data;
};

// Pausar o activar disponibilidad en tiempo real (RN-05)
export const changeHotelAvailability = async (hotelId, isAvailable, token) => {
  const res = await fetch(`${API_URL}/${hotelId}/availability`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isAvailable }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al cambiar disponibilidad");
  return data;
};