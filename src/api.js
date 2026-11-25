const API_URL = "http://localhost:3001";

export async function getEtudiants() {
  const response = await fetch(`${API_URL}/etudiants`);
  if (!response.ok) throw new Error("Impossible de charger les étudiants");
  return response.json();
}

export async function getEtudiant(id) {
  const response = await fetch(`${API_URL}/etudiants/${id}`);
  if (!response.ok) throw new Error("Étudiant introuvable");
  return response.json();
}

export async function ajouterEtudiant(etudiant) {
  const response = await fetch(`${API_URL}/etudiants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(etudiant)
  });
  if (!response.ok) throw new Error("Erreur pendant l'ajout");
  return response.json();
}

export async function modifierEtudiant(id, etudiant) {
  const response = await fetch(`${API_URL}/etudiants/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(etudiant)
  });
  if (!response.ok) throw new Error("Erreur pendant la modification");
  return response.json();
}

export async function supprimerEtudiant(id) {
  const response = await fetch(`${API_URL}/etudiants/${id}`, {
    method: "DELETE"
  });
  if (!response.ok) throw new Error("Erreur pendant la suppression");
}
