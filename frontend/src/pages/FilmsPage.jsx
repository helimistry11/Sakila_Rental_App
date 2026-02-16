import { useState } from "react";
import { Link } from "react-router-dom";
import { searchFilms, rentFilm } from "../api";

export default function FilmsPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("title");
  const [films, setFilms] = useState([]);

  const [customerId, setCustomerId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [rentingFilmId, setRentingFilmId] = useState(null);

  async function handleSearch() {
    const q = query.trim();
    if (q.length < 2) {
      setError("Please enter a search term");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setLoading(true);
      const results = await searchFilms(type, query);
      setFilms(results);

      if (!results || results.length === 0) {
        setSuccess("No films found");
      }
    } catch (err) {
      setError("Failed to search films");
    } finally {
      setLoading(false);
    }
  }

  async function handleRent(filmId) {
    const cid = customerId.trim();

    if (!cid) {
      setError("Please enter a customer ID");
      return;
    }
    if (!/^\d+$/.test(cid)) {
      setError("Customer ID must be a number");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setRentingFilmId(filmId);

      const res = await rentFilm(filmId, Number(cid));
      setSuccess(`Rented successfully! Inventory ID: ${res.inventory_id}`);
    } catch (err) {
      setError(err?.message || "Failed to rent film");
    } finally {
      setRentingFilmId(null);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Films Page</h2>

      <div style={{ marginBottom: "10px" }}>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="title">Film Title</option>
          <option value="actor">Actor</option>
          <option value="genre">Genre</option>
        </select>

        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ marginLeft: "10px" }}
        />

        <button onClick={handleSearch} style={{ marginLeft: "10px" }} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Rent controls */}
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Customer ID (to rent)"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <ul>
        {films.map((film) => (
          <li key={film.film_id}>
            {/* Feature #2: click title to view details */}
            <Link to={`/film/${film.film_id}`} style={{ marginRight: "10px" }}>
              {film.title}
            </Link>
            ({film.release_year})

            {/* Feature #3: rent button */}
            <button
              onClick={() => handleRent(film.film_id)}
              style={{ marginLeft: "10px" }}
              disabled={rentingFilmId === film.film_id}
            >
              {rentingFilmId === film.film_id ? "Renting..." : "Rent"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
