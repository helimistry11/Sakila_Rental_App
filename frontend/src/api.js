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

export async function getCustomers(page = 1, pageSize = 10) {
  const res = await fetch(`${BASE}/customers?page=${page}&page_size=${pageSize}`);
  return res.json();
}

export async function searchCustomers({ customer_id = "", first_name = "", last_name = "", page = 1, pageSize = 10 }) {
  const params = new URLSearchParams();
  if (customer_id) params.append("customer_id", customer_id);
  if (first_name) params.append("first_name", first_name);
  if (last_name) params.append("last_name", last_name);
  params.append("page", String(page));
  params.append("page_size", String(pageSize));

  const res = await fetch(`${BASE}/customers/search?${params.toString()}`);
  return res.json();
}

export async function addCustomer(payload) {
  const res = await fetch(`${BASE}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data.error || `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return data;
}

export async function getStores() {
  const res = await fetch(`${BASE}/stores`);
  return res.json();
}