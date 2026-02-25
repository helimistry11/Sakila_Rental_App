import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getActor } from "../api";

export default function ActorDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    getActor(id).then(setData);
  }, [id]);

  if (!data) return <div className="container py-4">Loading...</div>;
  if (data.error) return <div className="container py-4">{data.error}</div>;

  const a = data.actor;

  return (
    <div className="container py-4">
      <Link className="text-decoration-none" to="/">← Back</Link>

      <div className="card shadow-sm mt-3">
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <div>
            <h2 className="m-0">{a.first_name} {a.last_name}</h2>
            <div className="opacity-75">Actor ID: {a.actor_id}</div>
          </div>
          <span className="badge bg-info text-dark rounded-pill">
            Total Films: {a.film_count}
          </span>
        </div>

        <div className="card-body">
          <h4 className="mb-3">Top 5 Rented Films for This Actor</h4>

          <ul className="list-group">
            {data.top_films.map((f) => (
              <li key={f.film_id} className="list-group-item d-flex justify-content-between align-items-center">
                <Link className="text-decoration-none fw-semibold" to={`/film/${f.film_id}`}>
                  {f.title}
                </Link>
                <span className="badge bg-dark rounded-pill">
                  Rentals: {f.rental_count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}