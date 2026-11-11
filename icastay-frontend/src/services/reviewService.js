const API_URL = "http://localhost:4000/api/reviews";

export const fetchHotelReviews = async (hotelId) => {
  const res = await fetch(`${API_URL}/hotel/${hotelId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al cargar reseñas");
  return data;
};

export const postHotelReview = async (hotelId, reviewData, token) => {
  const res = await fetch(`${API_URL}/hotel/${hotelId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reviewData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al publicar reseña");
  return data;
};

export const manageReviewPartner = async (reviewId, payload, token) => {
  const res = await fetch(`${API_URL}/${reviewId}/manage`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al gestionar reseña");
  return data;
};