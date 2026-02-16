const BASE = "http://127.0.0.1:5000/api";

export async function getTopFilms() {
  const res = await fetch(`${BASE}/top-films`);
  return res.json();
}

export async function getFilm(id) {
  const res = await fetch(`${BASE}/film/${id}`);
  return res.json();
}

export async function getTopActors() {
  const res = await fetch(`${BASE}/top-actors`);
  return res.json();
}

export async function getActor(id) {
  const res = await fetch(`${BASE}/actor/${id}`);
  return res.json();
}

export async function searchFilms(type, query) {
  const url = `${BASE}/films/search?type=${encodeURIComponent(
    type
  )}&q=${encodeURIComponent(query)}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) throw new Error(data?.error || "Search failed");
  return data;
}

export async function rentFilm(filmId, customerId) {
  const res = await fetch(`${BASE}/rent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ film_id: filmId, customer_id: customerId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Rent failed");
  return data;
}