const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_URL = `${BASE_URL}/api/auth`;

export const registerUser = async (userData) => {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al registrar usuario");
  return data;
};

export const loginUser = async (credentials) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");
  return data;
};

export const saveTravelPreference = async (preference, token) => {
  const res = await fetch(`${API_URL}/preferences`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ travelPreference: preference }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al guardar preferencia");
  return data;
};