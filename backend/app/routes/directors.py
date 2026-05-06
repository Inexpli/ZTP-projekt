from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.services.director_service import (
    get_directors_paginated,
    get_director_by_id,
    create_director,
    update_director,
    delete_director,
    add_director_to_movie,
    remove_director_from_movie,
)

directors_bp = Blueprint("directors", __name__)


# GET /directors/?page=&per_page=&search=
@directors_bp.route("/", methods=["GET"])
def get_directors():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    search = request.args.get("search", None)
    return jsonify(get_directors_paginated(page, per_page, search)), 200


# GET /directors/<id>?include_movies=true
@directors_bp.route("/<int:director_id>", methods=["GET"])
def get_director(director_id):
    include_movies = request.args.get("include_movies", "false").lower() == "true"
    director = get_director_by_id(director_id, include_movies=include_movies)
    if not director:
        return jsonify({"error": "Reżyser nie został znaleziony"}), 404
    return jsonify(director), 200


# POST /directors/
@directors_bp.route("/", methods=["POST"])
@jwt_required()
def add_director():
    try:
        data = request.get_json()
        return jsonify({"message": "Reżyser dodany", "director": create_director(data)}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        return jsonify({"error": "Błąd podczas dodawania reżysera"}), 500


# PUT /directors/<id>
@directors_bp.route("/<int:director_id>", methods=["PUT"])
@jwt_required()
def edit_director(director_id):
    try:
        data = request.get_json()
        updated = update_director(director_id, data)
        if not updated:
            return jsonify({"error": "Reżyser nie został znaleziony"}), 404
        return jsonify({"message": "Zaktualizowano", "director": updated}), 200
    except Exception:
        return jsonify({"error": "Błąd podczas aktualizacji"}), 500


# DELETE /directors/<id>
@directors_bp.route("/<int:director_id>", methods=["DELETE"])
@jwt_required()
def remove_director(director_id):
    if delete_director(director_id):
        return jsonify({"message": "Reżyser usunięty"}), 200
    return jsonify({"error": "Reżyser nie został znaleziony"}), 404


# ─── Przypisanie reżysera do filmu ───────────────────────────────────────────

# POST /directors/movie/<movie_id>  body: {director_id}
@directors_bp.route("/movie/<int:movie_id>", methods=["POST"])
@jwt_required()
def assign_director(movie_id):
    try:
        data = request.get_json()
        if not data or "director_id" not in data:
            return jsonify({"error": "Brak director_id"}), 400
        result = add_director_to_movie(movie_id, data["director_id"])
        return jsonify({"message": "Reżyser przypisany", "entry": result}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        return jsonify({"error": "Błąd podczas przypisywania"}), 500


# DELETE /directors/movie/<movie_id>/<director_id>
@directors_bp.route("/movie/<int:movie_id>/<int:director_id>", methods=["DELETE"])
@jwt_required()
def unassign_director(movie_id, director_id):
    try:
        remove_director_from_movie(movie_id, director_id)
        return jsonify({"message": "Reżyser usunięty z filmu"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception:
        return jsonify({"error": "Błąd podczas usuwania"}), 500
