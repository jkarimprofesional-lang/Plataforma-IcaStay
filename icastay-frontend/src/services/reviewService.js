const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_URL = `${BASE_URL}/api/reviews`;

export const fetchHotelReviews = async (hotelId) => {
  const res = await fetch(`${API_URL}/hotel/${hotelId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al cargar reseñas");
  return data;
};

export const createReview = async (reviewData, token) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reviewData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al enviar la reseña");
  return data;
};

export const updateReview = async (reviewId, updateData, token) => {
  const res = await fetch(`${API_URL}/${reviewId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al actualizar la reseña");
  return data;
};