export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/+$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    cache: "no-store",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const error = new Error(`API request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) return null;
  return response.json();
}

export function getSession() {
  return request("/auth/session").catch(error => {
    if (error.status === 401) return null;
    throw error;
  });
}

export function login(email, password) {
  return request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export function logout() {
  return request("/auth/logout", { method: "POST" });
}

export function getEtudiants() {
  return request("/etudiants");
}

export function getEtudiant(id) {
  return request(`/etudiants/${encodeURIComponent(id)}`);
}

export function ajouterEtudiant(etudiant) {
  return request("/etudiants", { method: "POST", body: JSON.stringify(etudiant) });
}

export function modifierEtudiant(id, etudiant) {
  return request(`/etudiants/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(etudiant) });
}

export function supprimerEtudiant(id) {
  return request(`/etudiants/${encodeURIComponent(id)}`, { method: "DELETE" });
}
