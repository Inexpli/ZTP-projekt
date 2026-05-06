# app/routes/movies.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from app.services.movie_service import (
    get_all_movies,
    get_movies_paginated,
    get_movie_by_id,
    create_movie,
    update_movie,
    delete_movie,
)

movies_bp = Blueprint("movies", __name__)


# GET /movies/?page=&per_page=&search=&genre_id=
@movies_bp.route("/", methods=["GET"])
def get_movies():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    search = request.args.get("search", None)
    genre_id = request.args.get("genre_id", None, type=int)

    # Próbujemy pobrać tożsamość użytkownika, ale nie wyrzucamy błędu jeśli go nie ma
    user_id = None
    try:
        # optional=True pozwala na dostęp niezalogowanym użytkownikom
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
    except Exception:
        # W razie błędu dekodowania tokenu traktujemy użytkownika jako gościa
        user_id = None

    # Przekazujemy user_id do serwisu, aby w JEDNYM zapytaniu do bazy
    # sprawdzić filmy i ich statusy wypożyczenia przez tego usera
    result = get_movies_paginated(page, per_page, search, genre_id, user_id=user_id)
    return jsonify(result), 200


# GET /movies/<movie_id>
@movies_bp.route("/<int:movie_id>", methods=["GET"])
def get_movie(movie_id):
    # Tutaj też warto dodać opcjonalny user_id, jeśli na widoku detali
    # również chcesz od razu wiedzieć, czy film jest wypożyczony
    user_id = None
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
    except Exception:
        user_id = None

    movie = get_movie_by_id(movie_id, user_id=user_id)
    if not movie:
        return jsonify({"error": "Film nie został znaleziony"}), 404
    return jsonify(movie), 200


# POST /movies/
@movies_bp.route("/", methods=["POST"])
@jwt_required()
def add_movie():
    try:
        data = request.get_json()
        new_movie = create_movie(data)
        return jsonify({"message": "Film dodany pomyślnie", "movie": new_movie}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        return jsonify({"error": "Błąd podczas dodawania filmu"}), 500


# PUT /movies/<movie_id>
@movies_bp.route("/<int:movie_id>", methods=["PUT"])
@jwt_required()
def edit_movie(movie_id):
    try:
        data = request.get_json()
        updated_movie = update_movie(movie_id, data)
        if not updated_movie:
            return jsonify({"error": "Film nie został znaleziony"}), 404
        return jsonify({"message": "Film zaktualizowany", "movie": updated_movie}), 200
    except Exception:
        return jsonify({"error": "Błąd podczas aktualizacji filmu"}), 500


# DELETE /movies/<movie_id>
@movies_bp.route("/<int:movie_id>", methods=["DELETE"])
@jwt_required()
def remove_movie(movie_id):
    if delete_movie(movie_id):
        return jsonify({"message": "Film został usunięty"}), 200
    return jsonify({"error": "Film nie został znaleziony"}), 404
