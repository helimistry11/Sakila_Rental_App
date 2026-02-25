from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import text
import os
from database import db, init_db
import queries as Q
import re
from dotenv import load_dotenv
load_dotenv()

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

@app.get("/api/customers")
def customers_list():
    """
    /api/customers?page=1&page_size=10
    """
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("page_size", 10))

    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 10
    if page_size > 50:
        page_size = 50

    offset = (page - 1) * page_size

    total_row = run_query(Q.CUSTOMERS_COUNT, one=True)
    total = total_row["total"] if total_row else 0

    rows = run_query(Q.CUSTOMERS_LIST, {"limit": page_size, "offset": offset})

    return jsonify({
        "page": page,
        "page_size": page_size,
        "total": total,
        "customers": rows
    })


@app.get("/api/customers/search")
def customers_search():
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("page_size", 10))

    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 10
    if page_size > 50:
        page_size = 50

    offset = (page - 1) * page_size

    customer_id_raw = request.args.get("customer_id", "").strip()
    first_name_raw = request.args.get("first_name", "").strip()
    last_name_raw = request.args.get("last_name", "").strip()

    customer_id = int(customer_id_raw) if customer_id_raw.isdigit() else None
    first_name = f"%{first_name_raw}%" if first_name_raw else None
    last_name = f"%{last_name_raw}%" if last_name_raw else None

    params = {
        "customer_id": customer_id,
        "first_name": first_name,
        "last_name": last_name,
        "limit": page_size,
        "offset": offset
    }

    total_row = run_query(Q.CUSTOMERS_SEARCH_COUNT, params, one=True)
    total = total_row["total"] if total_row else 0

    rows = run_query(Q.CUSTOMERS_SEARCH, params)

    return jsonify({
        "page": page,
        "page_size": page_size,
        "total": total,
        "customers": rows
    })
    
@app.post("/api/customers")
def customers_add():
    data = request.get_json(force=True) or {}

    first_name = (data.get("first_name") or "").strip()
    last_name = (data.get("last_name") or "").strip()
    email = (data.get("email") or "").strip()

    if not first_name or not last_name or not email:
        return jsonify({"error": "First_name, last_name, and email are required."}), 400

    email_pattern = r"^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$"
    if not re.match(email_pattern, email):
        return jsonify({"error": "Invalid email. Must look like name@domain.com."}), 400

    store_id = int(data.get("store_id", 1))
    active = int(data.get("active", 1))
    
    store_ok = run_query("SELECT 1 AS ok FROM store WHERE store_id = :store_id;", {"store_id": store_id}, one=True)
    if not store_ok:
        return jsonify({"error": f"Invalid store_id: {store_id}"}), 400

    default_address_id = int(os.getenv("DEFAULT_ADDRESS_ID", "1"))

    params = {
        "store_id": store_id,
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "address_id": default_address_id,
        "active": active
    }

    run_query(Q.CUSTOMER_INSERT, params)
    new_id_row = run_query(Q.LAST_INSERT_ID, one=True)
    new_id = new_id_row["customer_id"] if new_id_row else None

    return jsonify({"message": "Customer created", "customer_id": new_id}), 201

@app.get("/api/stores")
def stores_list():
    return jsonify(run_query(Q.STORES_LIST))

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)

