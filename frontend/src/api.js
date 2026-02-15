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