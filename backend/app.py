from flask import Flask, jsonify, request
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

@app.get("/api/films/search")
def film_search():
    search_type = request.args.get("type", "title")
    q = request.args.get("q", "").strip()

    if not q:
        return jsonify({"error": "Query is required"}), 400
    if len(q) < 2:
        return jsonify({"error": "Query must be at least 2 characters"}), 400

    like_q = f"%{q}%"

    if search_type == "title":
        sql = Q.FILM_SEARCH_BY_TITLE
    elif search_type == "actor":
        sql = Q.FILM_SEARCH_BY_ACTOR
    elif search_type == "genre":
        # you named it CATEGORY in queries.py
        sql = Q.FILM_SEARCH_BY_CATEGORY
    else:
        return jsonify({"error": "Invalid search type"}), 400

    return jsonify(run_query(sql, {"q": like_q}))

@app.post("/api/rent")
def rent_film():
    data = request.get_json(silent=True) or {}
    film_id = data.get("film_id")
    customer_id = data.get("customer_id")

    if film_id is None or customer_id is None:
        return jsonify({"error": "film_id and customer_id are required"}), 400

    try:
        film_id = int(film_id)
        customer_id = int(customer_id)
    except Exception:
        return jsonify({"error": "film_id and customer_id must be integers"}), 400

    cust = run_query(Q.CUSTOMER_EXISTS, {"customer_id": customer_id}, one=True)
    if not cust:
        return jsonify({"error": "Customer not found"}), 404

    inv = run_query(Q.AVAILABLE_INVENTORY_FOR_FILM, {"film_id": film_id}, one=True)
    if not inv:
        return jsonify({"error": "No available copies to rent"}), 409

    run_query(Q.CREATE_RENTAL, {"inventory_id": inv["inventory_id"], "customer_id": customer_id})
    return jsonify({"ok": True, "inventory_id": inv["inventory_id"]})

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

