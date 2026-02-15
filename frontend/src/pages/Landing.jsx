import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTopFilms, getTopActors } from "../api";

export default function Landing() {
  const [films, setFilms] = useState([]);
  const [actors, setActors] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getTopFilms(), getTopActors()])
      .then(([filmsData, actorsData]) => {
        setFilms(filmsData);
        setActors(actorsData);
      })
      .catch(() =>
        setError("Could not load data from Flask. Is the backend running on 127.0.0.1:5000?")
      );
  }, []);

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h1 className="mb-1">Landing Page</h1>
          <div className="text-muted">Sakila Rental Dashboard</div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <div className="fw-semibold">Top 5 Rented Films (All Time)</div>
              <small className="opacity-75">Badge = total number of rentals</small>
            </div>
            <ul className="list-group list-group-flush">
              {films.map((f) => (
                <li
                  key={f.film_id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <Link className="fw-semibold text-decoration-none" to={`/film/${f.film_id}`}>
                      {f.title}
                    </Link>
                    <div className="small text-muted">{f.category}</div>
                  </div>

                  <span className="badge bg-dark rounded-pill">
                    Rentals: {f.rental_count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <div className="fw-semibold">Top 5 Actors (Films in Store)</div>
              <small className="opacity-75">Badge = number of unique films in inventory</small>
            </div>
            <ul className="list-group list-group-flush">
              {actors.map((a) => (
                <li
                  key={a.actor_id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <Link className="fw-semibold text-decoration-none" to={`/actor/${a.actor_id}`}>
                    {a.first_name} {a.last_name}
                  </Link>

                  <span className="badge bg-dark rounded-pill">
                    Films: {a.movies}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 text-muted small">
        Tip: Click a film to view description, release year, rating, and more.
      </div>
    </div>
  );
}