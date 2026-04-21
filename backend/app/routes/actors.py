from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.services.actor_service import (
    get_actors_paginated,
    get_actor_by_id,
    create_actor,
    update_actor,
    delete_actor,
    add_actor_to_movie,
    remove_actor_from_movie,
)

actors_bp = Blueprint("actors", __name__)


# GET /actors/?page=&per_page=&search=
@actors_bp.route("/", methods=["GET"])
def get_actors():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    search = request.args.get("search", None)
    return jsonify(get_actors_paginated(page, per_page, search)), 200


# GET /actors/<id>?include_movies=true
@actors_bp.route("/<int:actor_id>", methods=["GET"])
def get_actor(actor_id):
    include_movies = request.args.get("include_movies", "false").lower() == "true"
    actor = get_actor_by_id(actor_id, include_movies=include_movies)
    if not actor:
        return jsonify({"error": "Aktor nie został znaleziony"}), 404
    return jsonify(actor), 200


# POST /actors/  (staff/admin)
@actors_bp.route("/", methods=["POST"])
@jwt_required()
def add_actor():
    try:
        data = request.get_json()
        return jsonify({"message": "Aktor dodany", "actor": create_actor(data)}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        return jsonify({"error": "Błąd podczas dodawania aktora"}), 500


# PUT /actors/<id>
@actors_bp.route("/<int:actor_id>", methods=["PUT"])
@jwt_required()
def edit_actor(actor_id):
    try:
        data = request.get_json()
        updated = update_actor(actor_id, data)
        if not updated:
            return jsonify({"error": "Aktor nie został znaleziony"}), 404
        return jsonify({"message": "Zaktualizowano", "actor": updated}), 200
    except Exception:
        return jsonify({"error": "Błąd podczas aktualizacji"}), 500


# DELETE /actors/<id>
@actors_bp.route("/<int:actor_id>", methods=["DELETE"])
@jwt_required()
def remove_actor(actor_id):
    if delete_actor(actor_id):
        return jsonify({"message": "Aktor usunięty"}), 200
    return jsonify({"error": "Aktor nie został znaleziony"}), 404


# ─── Przypisanie aktora do filmu ──────────────────────────────────────────────

# POST /actors/movie/<movie_id>  body: {actor_id, role}
@actors_bp.route("/movie/<int:movie_id>", methods=["POST"])
@jwt_required()
def assign_actor(movie_id):
    try:
        data = request.get_json()
        if not data or "actor_id" not in data:
            return jsonify({"error": "Brak actor_id"}), 400
        result = add_actor_to_movie(movie_id, data["actor_id"], data.get("role"))
        return jsonify({"message": "Aktor przypisany", "entry": result}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        return jsonify({"error": "Błąd podczas przypisywania"}), 500


# DELETE /actors/movie/<movie_id>/<actor_id>
@actors_bp.route("/movie/<int:movie_id>/<int:actor_id>", methods=["DELETE"])
@jwt_required()
def unassign_actor(movie_id, actor_id):
    try:
        remove_actor_from_movie(movie_id, actor_id)
        return jsonify({"message": "Aktor usunięty z obsady"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception:
        return jsonify({"error": "Błąd podczas usuwania"}), 500
