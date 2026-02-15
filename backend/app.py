from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import text

from database import db, init_db
import queries as Q

app = Flask(__name__)
CORS(app)
init_db(app)

def run_query(sql: str, params=None, one: bool = False):
    result = db.session.execute(text(sql), params or {})

    if result.returns_rows:
        if one:
            row = result.mappings().first()
            return dict(row) if row else None
        rows = result.mappings().all()
        return [dict(r) for r in rows]

    db.session.commit()
    return None

@app.get("/api/health")
def health():
    return jsonify(run_query("SELECT 1 AS ok;", one=True))

@app.get("/api/top-films")
def top_films():
    return jsonify(run_query(Q.TOP_5_RENTED_FILMS))

@app.get("/api/film/<int:film_id>")
def film_details(film_id):
    film = run_query(Q.FILM_DETAILS, {"film_id": film_id}, one=True)
    if not film:
        return jsonify({"error": "Film not found"}), 404

    rc = run_query(Q.FILM_RENTAL_COUNT, {"film_id": film_id}, one=True)
    film["rental_count"] = rc["rental_count"] if rc else 0

    return jsonify(film)


@app.get("/api/top-actors")
def top_actors():
    return jsonify(run_query(Q.TOP_5_ACTORS_IN_STORE))

@app.get("/api/actor/<int:actor_id>")
def actor_details(actor_id):
    actor = run_query(Q.ACTOR_DETAILS, {"actor_id": actor_id}, one=True)
    if not actor:
        return jsonify({"error": "Actor not found"}), 404

    top_films = run_query(Q.ACTOR_TOP_5_RENTED, {"actor_id": actor_id})

    fc = run_query(Q.ACTOR_FILM_COUNT, {"actor_id": actor_id}, one=True)
    actor["film_count"] = fc["film_count"] if fc else 0

    return jsonify({"actor": actor, "top_films": top_films})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)

