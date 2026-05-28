from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.services.genre_service import (
    get_all_genres,
    get_genre_by_id,
    create_genre,
    update_genre,
    delete_genre,
)

genres_bp = Blueprint("genres", __name__)


@genres_bp.route("/", methods=["GET"])
def get_genres():
    return jsonify({"genres": get_all_genres()}), 200


@genres_bp.route("/<int:genre_id>", methods=["GET"])
def get_genre(genre_id):
    genre = get_genre_by_id(genre_id)
    if not genre:
        return jsonify({"error": "Gatunek nie zostaĹ‚ znaleziony"}), 404
    return jsonify(genre), 200


@genres_bp.route("/", methods=["POST"])
@jwt_required()
def add_genre():
    try:
        data = request.get_json()
        return jsonify({"message": "Gatunek dodany", "genre": create_genre(data)}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        return jsonify({"error": "BĹ‚Ä…d podczas dodawania gatunku"}), 500


@genres_bp.route("/<int:genre_id>", methods=["PUT"])
@jwt_required()
def edit_genre(genre_id):
    try:
        data = request.get_json()
        updated = update_genre(genre_id, data)
        if not updated:
            return jsonify({"error": "Gatunek nie zostaĹ‚ znaleziony"}), 404
        return jsonify({"message": "Zaktualizowano", "genre": updated}), 200
    except Exception:
        return jsonify({"error": "BĹ‚Ä…d podczas aktualizacji"}), 500


@genres_bp.route("/<int:genre_id>", methods=["DELETE"])
@jwt_required()
def remove_genre(genre_id):
    if delete_genre(genre_id):
        return jsonify({"message": "Gatunek usuniÄ™ty"}), 200
    return jsonify({"error": "Gatunek nie zostaĹ‚ znaleziony"}), 404
