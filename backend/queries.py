# Landing Page: Top 5 rented films (your query #6)
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

# Film details (based on your query #1, filtered by film_id)
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



# Landing Page: Top 5 actors that are part of films in the store
# (your query #3 + inventory join)
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

# Actor top 5 rented films (your query #7 generalized for any actor)
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