const API_URL = "http://localhost:4000/api/auth";

export const registerUser = async (datosUsuario) => {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datosUsuario),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al registrarse");
  return data;
};

export const loginUser = async (credenciales) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credenciales),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");
  return data;
};

export const saveTravelPreference = async (travelPreference, token) => {
  const res = await fetch(`${API_URL}/preferences`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ travelPreference }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al guardar preferencia");
  return data;
};