import { useState } from "react";
import { searchFilms } from "../api";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";

export default function Films() {
  const [type, setType] = useState("title");
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);

  async function onSearch() {
    const data = await searchFilms(type, q);
    setResults(data);
  }

  return (
    <div className="container py-4">
      <h2>Films</h2>

      <SearchBar type={type} setType={setType} q={q} setQ={setQ} onSearch={onSearch} />

      <ul className="list-group">
        {results.map(f => (
          <li key={f.film_id} className="list-group-item">
            <Link to={`/film/${f.film_id}`}>{f.title}</Link>
            <div className="text-muted small">
              {f.release_year} • {f.rating} {f.category ? `• ${f.category}` : ""}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
