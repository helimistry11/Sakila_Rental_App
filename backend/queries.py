# Landing Page
# Top 5 rented films
TOP_5_RENTED_FILMS = """
SELECT f.film_id, f.title, c.name AS category, COUNT(r.rental_id) AS rental_count
FROM film f
JOIN inventory i ON f.film_id = i.film_id
JOIN rental r ON i.inventory_id = r.inventory_id
JOIN film_category fc ON f.film_id = fc.film_id
JOIN category c ON fc.category_id = c.category_id
GROUP BY f.film_id, f.title, c.name
ORDER BY rental_count DESC
LIMIT 5;
"""

# Film details
FILM_DETAILS = """
SELECT 
  f.film_id,
  f.title,
  f.description,
  f.release_year,
  f.rating,
  f.length,
  f.rental_rate,
  f.replacement_cost,
  l.name AS language,
  c.name AS category
FROM film f
JOIN language l ON f.language_id = l.language_id
JOIN film_category fc ON f.film_id = fc.film_id
JOIN category c ON fc.category_id = c.category_id
WHERE f.film_id = :film_id;
"""

FILM_RENTAL_COUNT = """
SELECT f.film_id, COUNT(r.rental_id) AS rental_count
FROM film f
JOIN inventory i ON f.film_id = i.film_id
JOIN rental r ON i.inventory_id = r.inventory_id
WHERE f.film_id = :film_id
GROUP BY f.film_id;
"""



# Landing Page
TOP_5_ACTORS_IN_STORE = """
SELECT a.actor_id, a.first_name, a.last_name, COUNT(DISTINCT i.film_id) AS movies
FROM actor a
JOIN film_actor fa ON a.actor_id = fa.actor_id
JOIN inventory i ON fa.film_id = i.film_id
GROUP BY a.actor_id, a.first_name, a.last_name
ORDER BY movies DESC
LIMIT 5;
"""

# Actor details
ACTOR_DETAILS = """
SELECT a.actor_id, a.first_name, a.last_name
FROM actor a
WHERE a.actor_id = :actor_id;
"""

# Actor top 5 rented films
ACTOR_TOP_5_RENTED = """
SELECT f.film_id, f.title, COUNT(r.rental_id) AS rental_count
FROM film f
JOIN film_actor fa ON f.film_id = fa.film_id
JOIN inventory i ON f.film_id = i.film_id
JOIN rental r ON i.inventory_id = r.inventory_id
WHERE fa.actor_id = :actor_id
GROUP BY f.film_id, f.title
ORDER BY rental_count DESC
LIMIT 5;
"""

ACTOR_FILM_COUNT = """
SELECT a.actor_id, COUNT(fa.film_id) AS film_count
FROM actor a
JOIN film_actor fa ON a.actor_id = fa.actor_id
WHERE a.actor_id = :actor_id
GROUP BY a.actor_id;
"""

# Films Page
# Search (title/actor/genre)
FILM_SEARCH_BY_TITLE = """
SELECT
  f.film_id,
  f.title,
  f.release_year,
  c.name AS category
FROM film f
JOIN film_category fc ON fc.film_id = f.film_id
JOIN category c ON c.category_id = fc.category_id
WHERE f.title LIKE :q
ORDER BY f.title
LIMIT 50;
"""

FILM_SEARCH_BY_ACTOR = """
SELECT DISTINCT
  f.film_id,
  f.title,
  f.release_year,
  c.name AS category
FROM film f
JOIN film_actor fa ON fa.film_id = f.film_id
JOIN actor a ON a.actor_id = fa.actor_id
JOIN film_category fc ON fc.film_id = f.film_id
JOIN category c ON c.category_id = fc.category_id
WHERE CONCAT(a.first_name, ' ', a.last_name) LIKE :q
ORDER BY f.title
LIMIT 50;
"""

FILM_SEARCH_BY_CATEGORY = """
SELECT
  f.film_id,
  f.title,
  f.release_year,
  c.name AS category
FROM film f
JOIN film_category fc ON fc.film_id = f.film_id
JOIN category c ON c.category_id = fc.category_id
WHERE c.name LIKE :q
ORDER BY f.title
LIMIT 50;
"""

# Films Page
# Renting
CUSTOMER_EXISTS = """
SELECT customer_id
FROM customer
WHERE customer_id = :customer_id;
"""

AVAILABLE_INVENTORY_FOR_FILM = """
SELECT i.inventory_id
FROM inventory i
LEFT JOIN rental r
  ON r.inventory_id = i.inventory_id
 AND r.return_date IS NULL
WHERE i.film_id = :film_id
  AND r.rental_id IS NULL
LIMIT 1;
"""

CREATE_RENTAL = """
INSERT INTO rental (rental_date, inventory_id, customer_id, staff_id)
VALUES (NOW(), :inventory_id, :customer_id, 1);
"""

# Customers (pagination/search)
CUSTOMERS_LIST = """
SELECT
  c.customer_id,
  c.first_name,
  c.last_name,
  c.email,
  c.active,
  c.store_id,
  c.create_date
FROM customer c
ORDER BY c.customer_id
LIMIT :limit OFFSET :offset;
"""

CUSTOMERS_COUNT = """
SELECT COUNT(*) AS total
FROM customer c;
"""

CUSTOMERS_SEARCH = """
SELECT
  c.customer_id,
  c.first_name,
  c.last_name,
  c.email,
  c.active,
  c.store_id,
  c.create_date
FROM customer c
WHERE
  (:customer_id IS NULL OR c.customer_id = :customer_id)
  AND (:first_name IS NULL OR c.first_name LIKE :first_name)
  AND (:last_name IS NULL OR c.last_name LIKE :last_name)
ORDER BY c.customer_id
LIMIT :limit OFFSET :offset;
"""

CUSTOMERS_SEARCH_COUNT = """
SELECT COUNT(*) AS total
FROM customer c
WHERE
  (:customer_id IS NULL OR c.customer_id = :customer_id)
  AND (:first_name IS NULL OR c.first_name LIKE :first_name)
  AND (:last_name IS NULL OR c.last_name LIKE :last_name);
"""

# Add customer
CUSTOMER_INSERT = """
INSERT INTO customer
  (store_id, first_name, last_name, email, address_id, active, create_date)
VALUES
  (:store_id, :first_name, :last_name, :email, :address_id, :active, NOW());
"""

LAST_INSERT_ID = """
SELECT LAST_INSERT_ID() AS customer_id;
"""

STORES_LIST = """
SELECT store_id
FROM store
ORDER BY store_id;
"""