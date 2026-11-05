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