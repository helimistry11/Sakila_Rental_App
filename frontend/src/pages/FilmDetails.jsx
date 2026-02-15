import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getFilm } from "../api";

export default function FilmDetails() {
  const { id } = useParams();
  const [film, setFilm] = useState(null);

  useEffect(() => {
    getFilm(id).then(setFilm);
  }, [id]);

  if (!film) return <div className="container py-4">Loading...</div>;
  if (film.error) return <div className="container py-4">{film.error}</div>;

  return (
    <div className="container py-4">
      <Link className="text-decoration-none" to="/">← Back</Link>

      <div className="card shadow-sm mt-3">
        <div className="card-header bg-dark text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="m-0">{film.title}</h2>
            <span className="badge bg-warning text-dark rounded-pill">
              Rentals: {film.rental_count}
            </span>
          </div>
          <div className="opacity-75 mt-1">{film.category} • {film.language}</div>
        </div>

        <div className="card-body">
          <p className="lead mb-4">{film.description}</p>

          <div className="row g-3">
            <div className="col-md-4">
              <div className="p-3 border rounded">
                <div className="text-muted small">Release Year</div>
                <div className="fw-semibold">{film.release_year}</div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3 border rounded">
                <div className="text-muted small">Rating</div>
                <div className="fw-semibold">{film.rating}</div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3 border rounded">
                <div className="text-muted small">Length</div>
                <div className="fw-semibold">{film.length} min</div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3 border rounded">
                <div className="text-muted small">Rental Rate</div>
                <div className="fw-semibold">${film.rental_rate}</div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3 border rounded">
                <div className="text-muted small">Replacement Cost</div>
                <div className="fw-semibold">${film.replacement_cost}</div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3 border rounded">
                <div className="text-muted small">Film ID</div>
                <div className="fw-semibold">{film.film_id}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
